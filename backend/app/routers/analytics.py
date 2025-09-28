"""
Analytics router for document processing statistics and metrics.

This module provides endpoints for retrieving analytics about document processing,
including trends, performance metrics, and document type breakdowns.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime, timedelta, timezone
from typing import Dict, Optional
import logging

from app.dependencies import get_logger
from app.middleware.auth import get_current_active_user, require_admin
from app.models.user import User
from app.models.document import FinancialDocument, DocumentStatus, DocumentType

router = APIRouter(prefix="/analytics", tags=["analytics"])

logger = logging.getLogger(__name__)


@router.get("/overview")
async def get_analytics_overview(
    current_user: User = Depends(get_current_active_user),
    logger=Depends(get_logger)
) -> Dict[str, object]:
    """
    Get analytics overview including document counts, processing stats, etc.
    """
    logger.info(f"Analytics overview requested by user {current_user.id}")
    
    try:
        # Calculate time ranges
        now = datetime.now(timezone.utc)
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        week_start = today_start - timedelta(days=today_start.weekday())
        month_start = today_start.replace(day=1)

        # Base pipeline for all documents
        base_pipeline = [
            {"$match": {"user_id": str(current_user.id)}},
            {"$group": {
                "_id": None,
                "total_documents": {"$sum": 1},
                "total_processing_time": {
                    "$sum": {
                        "$cond": [
                            {"$and": [
                                {"$ne": ["$processing_started_at", None]},
                                {"$ne": ["$processing_completed_at", None]}
                            ]},
                            {"$divide": [
                                {"$subtract": ["$processing_completed_at", "$processing_started_at"]},
                                1000  # Convert to seconds
                            ]},
                            0
                        ]
                    }
                },
                "successful_docs": {
                    "$sum": {"$cond": [{"$eq": ["$status", "completed"]}, 1, 0]}
                },
                "total_confidence": {
                    "$sum": {"$ifNull": ["$confidence_score", 0]}
                },
                "high_confidence": {
                    "$sum": {"$cond": [{"$gte": ["$confidence_score", 0.9]}, 1, 0]}
                },
                "medium_confidence": {
                    "$sum": {"$cond": [
                        {"$and": [
                            {"$gte": ["$confidence_score", 0.7]},
                            {"$lt": ["$confidence_score", 0.9]}
                        ]},
                        1,
                        0
                    ]}
                },
                "low_confidence": {
                    "$sum": {"$cond": [{"$lt": ["$confidence_score", 0.7]}, 1, 0]}
                }
            }}
        ]

        # Get base statistics
        base_stats = await FinancialDocument.aggregate(base_pipeline).to_list()
        base_stats = base_stats[0] if base_stats else {
            "total_documents": 0,
            "total_processing_time": 0,
            "successful_docs": 0,
            "total_confidence": 0,
            "high_confidence": 0,
            "medium_confidence": 0,
            "low_confidence": 0
        }

        # Get document counts by type
        type_pipeline = [
            {"$match": {"user_id": str(current_user.id)}},
            {"$group": {
                "_id": "$document_type",
                "count": {"$sum": 1}
            }}
        ]
        type_stats = await FinancialDocument.aggregate(type_pipeline).to_list()
        document_types = {
            doc_type.value: 0 for doc_type in DocumentType
        }
        for stat in type_stats:
            document_types[stat["_id"]] = stat["count"]

        # Calculate time-based metrics
        time_pipeline = [
            {"$match": {
                "user_id": str(current_user.id),
                "created_at": {"$gte": month_start}
            }},
            {"$group": {
                "_id": {
                    "year": {"$year": "$created_at"},
                    "month": {"$month": "$created_at"},
                    "day": {"$dayOfMonth": "$created_at"}
                },
                "count": {"$sum": 1}
            }}
        ]
        time_stats = await FinancialDocument.aggregate(time_pipeline).to_list()

        # Count documents by time period
        docs_today = sum(1 for stat in time_stats if 
            datetime(stat["_id"]["year"], stat["_id"]["month"], stat["_id"]["day"]) >= today_start)
        docs_this_week = sum(1 for stat in time_stats if 
            datetime(stat["_id"]["year"], stat["_id"]["month"], stat["_id"]["day"]) >= week_start)
        docs_this_month = sum(stat["count"] for stat in time_stats)

        # Calculate derived metrics
        total_docs = base_stats["total_documents"]
        total_confidence_docs = (base_stats["high_confidence"] + 
                               base_stats["medium_confidence"] + 
                               base_stats["low_confidence"])
        
        return {
            "total_documents": total_docs,
            "documents_processed_today": docs_today,
            "documents_processed_this_week": docs_this_week,
            "documents_processed_this_month": docs_this_month,
            "average_processing_time_seconds": (
                base_stats["total_processing_time"] / base_stats["successful_docs"]
                if base_stats["successful_docs"] > 0 else 0
            ),
            "success_rate": (
                base_stats["successful_docs"] / total_docs
                if total_docs > 0 else 0
            ),
            "document_types": document_types,
            "confidence_scores": {
                "average": (
                    base_stats["total_confidence"] / total_confidence_docs
                    if total_confidence_docs > 0 else 0
                ),
                "high_confidence": (
                    base_stats["high_confidence"] / total_confidence_docs
                    if total_confidence_docs > 0 else 0
                ),
                "medium_confidence": (
                    base_stats["medium_confidence"] / total_confidence_docs
                    if total_confidence_docs > 0 else 0
                ),
                "low_confidence": (
                    base_stats["low_confidence"] / total_confidence_docs
                    if total_confidence_docs > 0 else 0
                )
            },
            "last_updated": datetime.now(timezone.utc).isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting analytics overview: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve analytics overview"
        )


@router.get("/trends")
async def get_processing_trends(
    days: int = 30,
    current_user: User = Depends(get_current_active_user),
    logger=Depends(get_logger)
) -> Dict[str, object]:
    """
    Get processing trends over a specified number of days.
    """
    logger.info(f"Processing trends requested for {days} days by user {current_user.id}")
    
    if days < 1 or days > 365:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Days parameter must be between 1 and 365"
        )
    
    try:
        # Calculate date range
        end_date = datetime.now(timezone.utc)
        start_date = end_date - timedelta(days=days)

        # Aggregate daily counts
        pipeline = [
            {"$match": {
                "user_id": str(current_user.id),
                "created_at": {"$gte": start_date, "$lte": end_date}
            }},
            {"$group": {
                "_id": {
                    "year": {"$year": "$created_at"},
                    "month": {"$month": "$created_at"},
                    "day": {"$dayOfMonth": "$created_at"}
                },
                "count": {"$sum": 1}
            }},
            {"$sort": {"_id.year": 1, "_id.month": 1, "_id.day": 1}}
        ]

        daily_stats = await FinancialDocument.aggregate(pipeline).to_list()

        # Create a complete date range with zeros for missing days
        daily_counts = []
        total_processed = 0
        current_date = start_date

        while current_date <= end_date:
            count = 0
            for stat in daily_stats:
                if (datetime(stat["_id"]["year"], stat["_id"]["month"], stat["_id"]["day"]).date() == 
                    current_date.date()):
                    count = stat["count"]
                    break
            
            daily_counts.append({
                "date": current_date.strftime("%Y-%m-%d"),
                "count": count
            })
            total_processed += count
            current_date += timedelta(days=1)

        # Calculate trend direction
        recent_counts = [entry["count"] for entry in daily_counts[-7:]]
        older_counts = [entry["count"] for entry in daily_counts[-14:-7]]
        recent_avg = sum(recent_counts) / len(recent_counts) if recent_counts else 0
        older_avg = sum(older_counts) / len(older_counts) if older_counts else 0

        if recent_avg > older_avg * 1.1:  # 10% increase
            trend_direction = "increasing"
        elif recent_avg < older_avg * 0.9:  # 10% decrease
            trend_direction = "decreasing"
        else:
            trend_direction = "stable"

        return {
            "period_days": days,
            "daily_counts": daily_counts,
            "total_processed": total_processed,
            "average_daily": total_processed // days if days > 0 else 0,
            "trend_direction": trend_direction
        }
        
    except Exception as e:
        logger.error(f"Error getting processing trends: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve processing trends"
        )


@router.get("/performance")
async def get_performance_metrics(
    current_user: User = Depends(get_current_active_user),
    logger=Depends(get_logger)
) -> Dict[str, object]:
    """
    Get performance metrics including response times, error rates, etc.
    """
    logger.info(f"Performance metrics requested by user {current_user.id}")
    
    try:
        # Calculate processing times
        pipeline = [
            {"$match": {
                "user_id": str(current_user.id),
                "processing_started_at": {"$ne": None},
                "processing_completed_at": {"$ne": None}
            }},
            {"$project": {
                "processing_time": {
                    "$divide": [
                        {"$subtract": ["$processing_completed_at", "$processing_started_at"]},
                        1  # Keep in milliseconds
                    ]
                },
                "status": 1
            }},
            {"$group": {
                "_id": None,
                "total_requests": {"$sum": 1},
                "successful_requests": {
                    "$sum": {"$cond": [{"$eq": ["$status", "completed"]}, 1, 0]}
                },
                "error_requests": {
                    "$sum": {"$cond": [{"$eq": ["$status", "failed"]}, 1, 0]}
                },
                "avg_time": {"$avg": "$processing_time"},
                "max_time": {"$max": "$processing_time"},
                "processing_times": {"$push": "$processing_time"}
            }}
        ]

        performance_stats = await FinancialDocument.aggregate(pipeline).to_list()
        stats = performance_stats[0] if performance_stats else {
            "total_requests": 0,
            "successful_requests": 0,
            "error_requests": 0,
            "avg_time": 0,
            "max_time": 0,
            "processing_times": []
        }

        # Calculate percentiles
        processing_times = sorted(stats["processing_times"])
        p95_index = int(len(processing_times) * 0.95) if processing_times else 0
        p99_index = int(len(processing_times) * 0.99) if processing_times else 0

        # Get system stats from database
        db_stats = await FinancialDocument.get_db().command("serverStatus")

        return {
            "response_times": {
                "average_ms": stats["avg_time"],
                "p95_ms": processing_times[p95_index] if p95_index < len(processing_times) else 0,
                "p99_ms": processing_times[p99_index] if p99_index < len(processing_times) else 0,
                "max_ms": stats["max_time"]
            },
            "error_rates": {
                "total_requests": stats["total_requests"],
                "successful_requests": stats["successful_requests"],
                "error_requests": stats["error_requests"],
                "error_rate_percentage": (
                    (stats["error_requests"] / stats["total_requests"]) * 100
                    if stats["total_requests"] > 0 else 0
                )
            },
            "throughput": {
                "requests_per_minute": stats["total_requests"] // 60,
                "requests_per_hour": stats["total_requests"] // 3600,
                "peak_requests_per_minute": max(
                    len([t for t in processing_times if t <= 60000]),  # requests within 1 minute
                    1
                )
            },
            "system_health": {
                "cpu_usage_percentage": db_stats.get("cpu", {}).get("user", 0) * 100,
                "memory_usage_percentage": (
                    (db_stats.get("mem", {}).get("resident", 0) / 
                     db_stats.get("mem", {}).get("virtual", 1)) * 100
                ),
                "disk_usage_percentage": db_stats.get("fsTotalSize", 0) / 100
            },
            "last_updated": datetime.now(timezone.utc).isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting performance metrics: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve performance metrics"
        )


@router.get("/document-types")
async def get_document_type_analytics(
    current_user: User = Depends(get_current_active_user),
    logger=Depends(get_logger)
) -> Dict[str, object]:
    """
    Get analytics specific to document types.
    """
    logger.info(f"Document type analytics requested by user {current_user.id}")
    
    try:
        pipeline = [
            {"$match": {"user_id": str(current_user.id)}},
            {"$group": {
                "_id": "$document_type",
                "count": {"$sum": 1},
                "avg_confidence": {"$avg": "$confidence_score"},
                "avg_processing_time": {
                    "$avg": {
                        "$cond": [
                            {"$and": [
                                {"$ne": ["$processing_started_at", None]},
                                {"$ne": ["$processing_completed_at", None]}
                            ]},
                            {"$divide": [
                                {"$subtract": ["$processing_completed_at", "$processing_started_at"]},
                                1000  # Convert to seconds
                            ]},
                            0
                        ]
                    }
                },
                "vendors": {"$addToSet": "$analysis_results.vendor"}
            }}
        ]

        type_stats = await FinancialDocument.aggregate(pipeline).to_list()

        # Prepare response format
        type_breakdown = {}
        for doc_type in DocumentType:
            stats = next((s for s in type_stats if s["_id"] == doc_type.value), None)
            if stats:
                # Filter out None values and get top 3 vendors
                vendors = [v for v in stats["vendors"] if v]
                vendors = sorted(vendors, key=vendors.count, reverse=True)[:3]
                
                type_breakdown[doc_type.value] = {
                    "count": stats["count"],
                    "average_confidence": stats["avg_confidence"] or 0,
                    "processing_time_avg_seconds": stats["avg_processing_time"] or 0,
                    "common_vendors": vendors or ["No vendors found"]
                }
            else:
                type_breakdown[doc_type.value] = {
                    "count": 0,
                    "average_confidence": 0,
                    "processing_time_avg_seconds": 0,
                    "common_vendors": ["No documents"]
                }

        return {
            "type_breakdown": type_breakdown,
            "last_updated": datetime.now(timezone.utc).isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting document type analytics: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve document type analytics"
        )
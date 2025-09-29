#!/usr/bin/env python
"""
Test script for running the Financial Document Analyzer Crew
Usage: python test_crew.py [document_path] [query]
"""
import sys
import os
from pathlib import Path

# Add the src directory to the Python path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from financial_document_analyzer_crew.main import run

if __name__ == "__main__":
    # Get document path and query from command line arguments
    document_path = sys.argv[1] if len(sys.argv) > 1 else None
    query = sys.argv[2] if len(sys.argv) > 2 else None
    
    # If no document path provided, use default from uploads
    if document_path is None:
        uploads_dir = Path(__file__).parent.parent / "uploads"
        document_path = str(uploads_dir / "39d1a31f-7b8d-4be2-87ff-9ad078c2f3a8.pdf")
        print(f"No document path provided. Using default: {document_path}")
    
    # If no query provided, use default
    if query is None:
        query = "What is the overall financial health of this company?"
        print(f"No query provided. Using default: {query}")
    
    # Check if document exists
    if not os.path.exists(document_path):
        print(f"ERROR: Document not found at: {document_path}")
        print("\nAvailable PDFs in uploads directory:")
        uploads_dir = Path(__file__).parent.parent / "uploads"
        if uploads_dir.exists():
            for pdf_file in uploads_dir.glob("*.pdf"):
                print(f"  - {pdf_file}")
        sys.exit(1)
    
    print(f"\n{'='*80}")
    print(f"Financial Document Analyzer Crew - Test Run")
    print(f"{'='*80}\n")
    
    # Run the crew
    result = run(document_path=document_path, query=query)
    
    print(f"\n{'='*80}")
    print(f"Analysis Complete")
    print(f"{'='*80}\n")
    print(result)
    print(f"\n{'='*80}\n")

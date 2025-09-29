from crewai.tools import BaseTool
from crewai_tools import SerperDevTool
from typing import Type
from pydantic import BaseModel, Field
import os
import PyPDF2
import pandas as pd
from pathlib import Path
import json
import re


class FinancialDocumentInput(BaseModel):
    """Input schema for FinancialDocumentTool."""
    document_path: str = Field(..., description="Path to the financial document to analyze (PDF, Excel, CSV).")


class FinancialDocumentTool(BaseTool):
    name: str = "Financial Document Reader"
    description: str = (
        "Reads and extracts content from financial documents including PDFs, Excel files, and CSV files. "
        "Validates if the document contains financial data and returns structured content for analysis."
    )
    args_schema: Type[BaseModel] = FinancialDocumentInput

    def _run(self, document_path: str) -> str:
        """
        Extract content from financial documents and validate if it's a financial document.
        
        Args:
            document_path: Path to the financial document
            
        Returns:
            Extracted text content with validation results and structure information
        """
        try:
            if not os.path.exists(document_path):
                return json.dumps({
                    "status": "error",
                    "message": f"Document not found at path: {document_path}",
                    "is_financial_document": False
                })
            
            file_path = Path(document_path)
            file_extension = file_path.suffix.lower()
            
            # Extract content based on file type
            if file_extension == '.pdf':
                extracted_content = self._extract_pdf_content(document_path)
            elif file_extension in ['.xlsx', '.xls']:
                extracted_content = self._extract_excel_content(document_path)
            elif file_extension == '.csv':
                extracted_content = self._extract_csv_content(document_path)
            else:
                return json.dumps({
                    "status": "error",
                    "message": f"Unsupported file format: {file_extension}. Supported formats: PDF, Excel (.xlsx, .xls), CSV",
                    "is_financial_document": False
                })
            
            # Validate if it's a financial document
            validation_result = self._validate_financial_document(extracted_content)
            
            # Return structured response
            return json.dumps({
                "status": "success",
                "file_path": document_path,
                "file_type": file_extension,
                "is_financial_document": validation_result["is_financial"],
                "confidence_score": validation_result["confidence"],
                "financial_indicators_found": validation_result["indicators"],
                "validation_summary": validation_result["summary"],
                "extracted_content": extracted_content,
                "content_length": len(extracted_content)
            }, indent=2)
                
        except Exception as e:
            return json.dumps({
                "status": "error",
                "message": f"Error processing document: {str(e)}",
                "is_financial_document": False
            })
    
    def _extract_pdf_content(self, pdf_path: str) -> str:
        """Extract text content from PDF file."""
        try:
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                content = []
                
                # Extract text from all pages
                for page_num, page in enumerate(pdf_reader.pages, 1):
                    page_text = page.extract_text()
                    if page_text.strip():
                        content.append(f"--- Page {page_num} ---\n{page_text}")
                
                if not content:
                    return "Warning: No text content extracted from PDF. Document may be image-based or encrypted."
                
                return "\n\n".join(content)
                
        except Exception as e:
            return f"Error reading PDF: {str(e)}"
    
    def _extract_excel_content(self, excel_path: str) -> str:
        """Extract content from Excel file."""
        try:
            # Read all sheets
            excel_file = pd.ExcelFile(excel_path)
            content = []
            
            for sheet_name in excel_file.sheet_names:
                df = pd.read_excel(excel_path, sheet_name=sheet_name)
                content.append(f"--- Sheet: {sheet_name} ---")
                content.append(f"Shape: {df.shape[0]} rows, {df.shape[1]} columns")
                content.append(f"Columns: {', '.join(df.columns.tolist())}")
                content.append("\nFirst 10 rows:")
                content.append(df.head(10).to_string())
                content.append("\n")
            
            return "\n".join(content)
            
        except Exception as e:
            return f"Error reading Excel file: {str(e)}"
    
    def _extract_csv_content(self, csv_path: str) -> str:
        """Extract content from CSV file."""
        try:
            df = pd.read_csv(csv_path)
            content = []
            content.append(f"CSV File Analysis")
            content.append(f"Shape: {df.shape[0]} rows, {df.shape[1]} columns")
            content.append(f"Columns: {', '.join(df.columns.tolist())}")
            content.append("\nFirst 10 rows:")
            content.append(df.head(10).to_string())
            content.append("\nData Types:")
            content.append(df.dtypes.to_string())
            
            return "\n".join(content)
            
        except Exception as e:
            return f"Error reading CSV file: {str(e)}"
    
    def _validate_financial_document(self, content: str) -> dict:
        """
        Validate if the document content indicates it's a financial document.
        
        Args:
            content: Extracted text content from the document
            
        Returns:
            Dictionary with validation results
        """
        # Financial keywords to look for
        financial_keywords = [
            # Financial statements
            'balance sheet', 'income statement', 'cash flow', 'statement of equity',
            'profit and loss', 'p&l', 'financial position', 'statement of operations',
            
            # Financial metrics
            'revenue', 'net income', 'gross profit', 'ebitda', 'assets', 'liabilities',
            'equity', 'shareholders', 'earnings per share', 'eps', 'return on equity',
            'debt to equity', 'current ratio', 'quick ratio', 'operating margin',
            
            # Accounting terms
            'accounts receivable', 'accounts payable', 'inventory', 'depreciation',
            'amortization', 'working capital', 'retained earnings', 'dividends',
            'capital expenditure', 'capex', 'operating cash flow',
            
            # Financial document types
            'annual report', 'quarterly report', '10-k', '10-q', 'financial statements',
            'audited', 'unaudited', 'consolidated', 'fiscal year', 'fy', 'q1', 'q2', 'q3', 'q4',
            
            # Currency and financial amounts
            '$', '€', '£', '¥', 'usd', 'eur', 'gbp', 'million', 'billion', 'thousand',
            
            # Industry specific
            'gaap', 'ifrs', 'sec', 'fasb', 'iasb', 'sox', 'sarbanes-oxley'
        ]
        
        # Convert content to lowercase for case-insensitive matching
        content_lower = content.lower()
        
        # Count financial keyword matches
        found_keywords = []
        for keyword in financial_keywords:
            if keyword in content_lower:
                found_keywords.append(keyword)
        
        # Check for financial number patterns (currency amounts)
        currency_patterns = [
            r'\$[\d,]+\.?\d*',  # Dollar amounts like $1,000.50
            r'[\d,]+\.?\d*\s*(million|billion|thousand)',  # Amounts with scale
            r'\(\$?[\d,]+\.?\d*\)',  # Negative amounts in parentheses
        ]
        
        financial_numbers = []
        for pattern in currency_patterns:
            matches = re.findall(pattern, content, re.IGNORECASE)
            financial_numbers.extend(matches)
        
        # Calculate confidence score
        keyword_score = min(len(found_keywords) * 5, 60)  # Max 60 points for keywords
        number_score = min(len(financial_numbers) * 10, 40)  # Max 40 points for financial numbers
        confidence_score = keyword_score + number_score
        
        # Determine if it's a financial document
        # More strict validation: require both minimum confidence and keyword count
        is_financial = confidence_score >= 30 and len(found_keywords) >= 3
        
        # Create summary
        if is_financial:
            summary = f"Document appears to be financial. Found {len(found_keywords)} financial keywords and {len(financial_numbers)} financial amount patterns."
        else:
            summary = f"Document does not appear to be financial. Only found {len(found_keywords)} financial keywords and {len(financial_numbers)} financial amount patterns."
        
        return {
            "is_financial": is_financial,
            "confidence": min(confidence_score, 100),
            "indicators": {
                "keywords_found": found_keywords[:10],  # Limit to first 10 found
                "keyword_count": len(found_keywords),
                "financial_numbers_found": len(financial_numbers),
                "sample_amounts": financial_numbers[:5]  # Show first 5 financial amounts
            },
            "summary": summary
        }


# Search tool for market research and benchmarking
search_tool = SerperDevTool()

from crewai.tools import BaseTool
from typing import Type
from pydantic import BaseModel, Field
import os
import PyPDF2
import pandas as pd
from pathlib import Path


class FinancialDocumentInput(BaseModel):
    """Input schema for FinancialDocumentTool."""
    document_path: str = Field(..., description="Path to the financial document to analyze (PDF, Excel, CSV).")


class FinancialDocumentTool(BaseTool):
    name: str = "Financial Document Reader"
    description: str = (
        "Reads and extracts content from financial documents including PDFs, Excel files, and CSV files. "
        "Returns the text content and basic structure information for financial analysis."
    )
    args_schema: Type[BaseModel] = FinancialDocumentInput

    def _run(self, document_path: str) -> str:
        """
        Extract content from financial documents.
        
        Args:
            document_path: Path to the financial document
            
        Returns:
            Extracted text content and structure information
        """
        try:
            if not os.path.exists(document_path):
                return f"Error: Document not found at path: {document_path}"
            
            file_path = Path(document_path)
            file_extension = file_path.suffix.lower()
            
            if file_extension == '.pdf':
                return self._extract_pdf_content(document_path)
            elif file_extension in ['.xlsx', '.xls']:
                return self._extract_excel_content(document_path)
            elif file_extension == '.csv':
                return self._extract_csv_content(document_path)
            else:
                return f"Error: Unsupported file format: {file_extension}. Supported formats: PDF, Excel (.xlsx, .xls), CSV"
                
        except Exception as e:
            return f"Error processing document: {str(e)}"
    
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

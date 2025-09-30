"""
Custom tools for Financial Document Analyzer Crew
"""
from crewai.tools import BaseTool
from crewai_tools import SerperDevTool
from typing import Type
from pydantic import BaseModel, Field
import os
import re

# Initialize Serper search tool
search_tool = SerperDevTool()


class FinancialDocumentInput(BaseModel):
    """Input schema for FinancialDocumentTool"""
    document_path: str = Field(..., description="Path to the financial document to analyze")


class FinancialDocumentTool(BaseTool):
    """
    Tool for reading and validating financial documents.
    Extracts text content and validates if the document contains financial data.
    """
    name: str = "Financial Document Reader and Validator"
    description: str = (
        "Reads financial documents (PDF) and validates if they contain financial data. "
        "Returns document content with confidence score and financial indicators. "
        "Use this tool to extract and validate financial documents before analysis."
    )
    args_schema: Type[BaseModel] = FinancialDocumentInput

    def _run(self, document_path: str) -> str:
        """
        Read and validate a financial document
        
        Args:
            document_path: Path to the financial document
            
        Returns:
            Document content with validation information
        """
        try:
            # Check if file exists
            if not os.path.exists(document_path):
                return f"ERROR: File not found at path: {document_path}"
            
            text = ""
            
            # Try multiple PDF extraction methods for robustness
            # Method 1: Try pdfplumber (preferred for financial documents - best for tables)
            try:
                import pdfplumber
                
                with pdfplumber.open(document_path) as pdf:
                    for page in pdf.pages:
                        page_text = page.extract_text()
                        if page_text:
                            text += page_text + "\n"
                
                if text and len(text.strip()) > 0:
                    print(f"✅ Successfully extracted {len(text)} characters using pdfplumber")
            except ImportError:
                print("⚠️  pdfplumber not available, trying PyPDF2...")
            except Exception as e:
                print(f"⚠️  pdfplumber failed: {e}, trying PyPDF2...")
            
            # Method 2: Try PyPDF2 as fallback
            if not text or len(text.strip()) == 0:
                try:
                    import PyPDF2
                    
                    with open(document_path, 'rb') as file:
                        pdf_reader = PyPDF2.PdfReader(file)
                        for page in pdf_reader.pages:
                            page_text = page.extract_text()
                            if page_text:
                                text += page_text + "\n"
                    
                    if text and len(text.strip()) > 0:
                        print(f"✅ Successfully extracted {len(text)} characters using PyPDF2")
                except Exception as e:
                    return f"ERROR: All PDF extraction methods failed. Last error: {str(e)}"
            
            # Final check if extraction succeeded
            if not text or len(text.strip()) == 0:
                return "ERROR: Unable to extract text from PDF. Document may be image-based, encrypted, or corrupted."
            
            # Clean up the text - remove excessive newlines
            text = re.sub(r'\n\n+', '\n\n', text)
            
            # Validate if document contains financial keywords
            financial_keywords = [
                'revenue', 'profit', 'loss', 'asset', 'liability', 'equity',
                'balance sheet', 'income statement', 'cash flow', 'financial statement',
                'earnings', 'expense', 'dividend', 'shareholder', 'fiscal year',
                'quarter', 'annual report', 'financial position', 'net income',
                'gross profit', 'operating income', 'ebitda', 'accounts receivable',
                'accounts payable', 'retained earnings', 'stockholder', 'fiscal',
                '$', 'million', 'billion', 'consolidated', 'audited', 'total assets',
                'total liabilities', 'operating expenses', 'cost of revenue'
            ]
            
            text_lower = text.lower()
            found_keywords = [kw for kw in financial_keywords if kw in text_lower]
            
            # Calculate confidence score based on keyword frequency
            keyword_count = sum(text_lower.count(kw) for kw in found_keywords)
            confidence_score = min(100, (len(found_keywords) * 10) + (keyword_count / 10))
            
            # Build validation result
            validation_status = "PASSED" if confidence_score >= 30 else "FAILED"
            
            # Prepare document excerpt (first 8000 chars for context)
            excerpt_length = min(8000, len(text))
            excerpt = text[:excerpt_length]
            
            result = f"""
DOCUMENT VALIDATION RESULT:
Status: {validation_status}
Confidence Score: {confidence_score:.1f}%
Financial Indicators Found: {len(found_keywords)}
Keywords Detected: {', '.join(found_keywords[:15])}
Document Path: {document_path}

DOCUMENT CONTENT (First {excerpt_length} characters):
{excerpt}
{'...[content truncated - full length: ' + str(len(text)) + ' characters]' if len(text) > excerpt_length else ''}

EXTRACTION SUMMARY:
- Total characters extracted: {len(text)}
- Total pages processed: Multiple pages
- Validation status: {validation_status}
"""
            return result
                
        except Exception as e:
            return f"ERROR: Unexpected error processing document: {str(e)}"


__all__ = ['FinancialDocumentTool', 'search_tool']
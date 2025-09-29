import warnings
from datetime import datetime

from financial_document_analyzer_crew.crew import FinancialDocumentAnalyzerCrew

warnings.filterwarnings("ignore", category=SyntaxWarning, module="pysbd")

def run(document_path: str = None, query: str = None):
    """
    Run the crew with financial document analysis.
    
    Args:
        document_path: Path to the financial document to analyze
        query: User query about the financial document
    """
    # Default values for testing if not provided
    if document_path is None:
        document_path = "/path/to/sample/financial_document.pdf"
    if query is None:
        query = "What is the overall financial health of this company?"
    
    inputs = {
        'document_path': document_path,
        'query': query,
        'current_year': str(datetime.now().year)
    }
    
    try:
        result = FinancialDocumentAnalyzerCrew().crew().kickoff(inputs=inputs)
        
        # Check if the result contains validation failure
        if isinstance(result, str) and "VALIDATION_FAILED" in result:
            return result  # Return the validation failure message directly
        
        # If result is a CrewOutput object, extract the output
        if hasattr(result, 'raw'):
            raw_output = result.raw
            if "VALIDATION_FAILED" in raw_output:
                return raw_output
        
        return result
    except Exception as e:
        # Check if the error is related to validation failure
        error_msg = str(e)
        if "VALIDATION_FAILED" in error_msg:
            return error_msg
        raise Exception(f"An error occurred while running the crew: {e}")


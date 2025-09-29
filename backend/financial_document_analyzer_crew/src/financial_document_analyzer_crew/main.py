import sys
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
        return result
    except Exception as e:
        raise Exception(f"An error occurred while running the crew: {e}")


def train():
    """
    Train the crew for a given number of iterations.
    """
    inputs = {
        'document_path': "/path/to/sample/financial_document.pdf",
        'query': "What is the overall financial health of this company?",
        'current_year': str(datetime.now().year)
    }
    try:
        FinancialDocumentAnalyzerCrew().crew().train(n_iterations=int(sys.argv[1]), filename=sys.argv[2], inputs=inputs)

    except Exception as e:
        raise Exception(f"An error occurred while training the crew: {e}")

def replay():
    """
    Replay the crew execution from a specific task.
    """
    try:
        FinancialDocumentAnalyzerCrew().crew().replay(task_id=sys.argv[1])

    except Exception as e:
        raise Exception(f"An error occurred while replaying the crew: {e}")

def test():
    """
    Test the crew execution and returns the results.
    """
    inputs = {
        'document_path': "/path/to/sample/financial_document.pdf",
        'query': "What is the overall financial health of this company?",
        'current_year': str(datetime.now().year)
    }
    
    try:
        FinancialDocumentAnalyzerCrew().crew().test(n_iterations=int(sys.argv[1]), eval_llm=sys.argv[2], inputs=inputs)

    except Exception as e:
        raise Exception(f"An error occurred while testing the crew: {e}")

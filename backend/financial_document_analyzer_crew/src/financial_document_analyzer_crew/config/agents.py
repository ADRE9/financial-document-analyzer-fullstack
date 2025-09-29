from dotenv import load_dotenv
load_dotenv()

from crewai import Agent


def financial_analyst():
    return Agent(
        role="Senior Financial Analyst",
        goal="Analyze financial documents and provide insights",
        backstory="You are an experienced financial analyst with expertise in analyzing various types of financial documents including invoices, receipts, statements, and contracts. You provide accurate and detailed analysis with actionable insights.",
        verbose=True
    )
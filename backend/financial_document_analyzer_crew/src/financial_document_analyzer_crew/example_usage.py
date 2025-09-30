"""
Example usage of the Financial Document Analyzer Agents
Demonstrates how to use the Python-based agent configuration
"""

from crewai import LLM
from .agents import FinancialDocumentAnalyzerAgents, create_agents
from .crew import FinancialDocumentAnalyzerCrew


def example_basic_usage():
    """Basic usage example with default LLM"""
    print("=== Basic Usage Example ===")
    
    # Create agents with default LLM (Gemini 1.5 Flash)
    agents = create_agents()
    
    # Get individual agents
    document_analyzer = agents.get_document_analyzer()
    financial_analyst = agents.get_financial_insights_analyst()
    risk_specialist = agents.get_risk_assessment_specialist()
    investment_advisor = agents.get_investment_advisor()
    
    print(f"Document Analyzer Role: {document_analyzer.role}")
    print(f"Financial Analyst Role: {financial_analyst.role}")
    print(f"Risk Specialist Role: {risk_specialist.role}")
    print(f"Investment Advisor Role: {investment_advisor.role}")
    
    # Get all agents at once
    all_agents = agents.get_all_agents()
    print(f"\nTotal agents created: {len(all_agents)}")


def example_custom_llm():
    """Example with custom LLM configuration"""
    print("\n=== Custom LLM Example ===")
    
    # Create custom LLM
    custom_llm = LLM(model="openai/gpt-4o", temperature=0.1)
    
    # Create agents with custom LLM
    agents = FinancialDocumentAnalyzerAgents(custom_llm)
    
    # Get an agent by name
    try:
        document_analyzer = agents.get_agent_by_name('document_analyzer')
        print(f"Document Analyzer with custom LLM: {document_analyzer.role}")
        print(f"LLM Model: {document_analyzer.llm.model}")
    except ValueError as e:
        print(f"Error: {e}")


def example_crew_integration():
    """Example showing integration with the main crew"""
    print("\n=== Crew Integration Example ===")
    
    # Create the crew (which uses the Python agents internally)
    crew = FinancialDocumentAnalyzerCrew()
    
    # The crew automatically uses the Python agents configuration
    print("Crew created with Python agents configuration")
    print(f"Number of agents: {len(crew.agents)}")
    print(f"Number of tasks: {len(crew.tasks)}")


def example_agent_details():
    """Show detailed information about each agent"""
    print("\n=== Agent Details ===")
    
    agents = create_agents()
    
    agent_names = [
        'document_analyzer',
        'financial_insights_analyst', 
        'risk_assessment_specialist',
        'investment_advisor'
    ]
    
    for name in agent_names:
        agent = agents.get_agent_by_name(name)
        print(f"\n--- {name.replace('_', ' ').title()} ---")
        print(f"Role: {agent.role}")
        print(f"Goal: {agent.goal[:100]}...")
        print(f"Tools: {[tool.__class__.__name__ for tool in agent.tools]}")
        print(f"Verbose: {agent.verbose}")
        print(f"Allow Delegation: {agent.allow_delegation}")


if __name__ == "__main__":
    """Run all examples"""
    example_basic_usage()
    example_custom_llm()
    example_crew_integration()
    example_agent_details()
    
    print("\n=== All Examples Completed ===")
    print("The YAML configuration has been successfully converted to Python!")
    print("Benefits of Python configuration:")
    print("- Better IDE support with autocomplete and type hints")
    print("- Easier debugging and testing")
    print("- More flexible configuration options")
    print("- Better integration with Python tooling")


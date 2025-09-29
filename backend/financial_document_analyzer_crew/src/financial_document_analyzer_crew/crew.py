from crewai import Agent, Crew, Process, Task, LLM
from crewai.project import CrewBase, agent, crew, task
from crewai.agents.agent_builder.base_agent import BaseAgent
from typing import List
from .tools import FinancialDocumentTool, search_tool

@CrewBase
class FinancialDocumentAnalyzerCrew():
    """FinancialDocumentAnalyzerCrew crew"""

    agents: List[BaseAgent]
    tasks: List[Task]
    
    def __init__(self):
        super().__init__()
        # Initialize LLM for all agents
        self.llm = LLM(model="gemini/gemini-1.5-flash")
    
    @agent
    def document_analyzer(self) -> Agent:
        """
        Financial Document Analyzer Agent
        Specializes in extracting and validating financial data from documents
        """
        return Agent(
            config=self.agents_config['document_analyzer'], # type: ignore[index]
            verbose=True,
            allow_delegation=False,  # This agent focuses on document extraction only
            tools=[FinancialDocumentTool()],  # Tool for reading and validating financial documents
            llm=self.llm  # Use Gemini 1.5 Flash for financial document analysis
        )

    @agent
    def financial_insights_analyst(self) -> Agent:
        """
        Financial Insights Analyst Agent
        Specializes in calculating ratios and analyzing financial performance
        """
        return Agent(
            config=self.agents_config['financial_insights_analyst'], # type: ignore[index]
            verbose=True,
            allow_delegation=False,  # This agent focuses on financial analysis only
            tools=[search_tool],  # Search tool for market benchmarking and industry research
            llm=self.llm  # Use Gemini 1.5 Flash for financial insights analysis
        )

    @agent
    def risk_assessment_specialist(self) -> Agent:
        """
        Risk Assessment Specialist Agent
        Specializes in evaluating financial and operational risks
        """
        return Agent(
            config=self.agents_config['risk_assessment_specialist'], # type: ignore[index]
            verbose=True,
            allow_delegation=False,  # This agent focuses on risk assessment only
            tools=[search_tool],  # Search tool for market risk research and economic indicators
            llm=self.llm  # Use Gemini 1.5 Flash for risk assessment
        )

    @agent
    def investment_advisor(self) -> Agent:
        """
        Investment Advisor Agent
        Synthesizes all analyses to provide investment recommendations
        """
        return Agent(
            config=self.agents_config['investment_advisor'], # type: ignore[index]
            verbose=True,
            allow_delegation=False,  # This agent synthesizes all previous work
            tools=[search_tool],  # Search tool for market trends and investment research
            llm=self.llm  # Use Gemini 1.5 Flash for investment recommendations
        )
    
    @task
    def document_analysis_task(self) -> Task:
        """
        Task: Extract and validate financial data from documents
        """
        return Task(
            config=self.tasks_config['document_analysis_task'], # type: ignore[index]
        )

    @task
    def financial_insights_task(self) -> Task:
        """
        Task: Analyze financial metrics and calculate key ratios
        Dependencies: Requires output from document_analysis_task
        """
        return Task(
            config=self.tasks_config['financial_insights_task'], # type: ignore[index]
        )

    @task
    def risk_assessment_task(self) -> Task:
        """
        Task: Assess financial and operational risks
        Dependencies: Requires output from document_analysis_task and financial_insights_task
        """
        return Task(
            config=self.tasks_config['risk_assessment_task'], # type: ignore[index]
        )

    @task
    def investment_recommendation_task(self) -> Task:
        """
        Task: Provide evidence-based investment recommendations
        Dependencies: Requires output from all previous tasks
        """
        return Task(
            config=self.tasks_config['investment_recommendation_task'], # type: ignore[index]
            output_file='investment_analysis_report.md'
        )

    @crew
    def crew(self) -> Crew:
        """Creates the FinancialDocumentAnalyzerCrew crew"""

        return Crew(
            agents=self.agents, # Automatically created by the @agent decorator
            tasks=self.tasks, # Automatically created by the @task decorator
            process=Process.sequential,
            verbose=True,
            # process=Process.hierarchical, # In case you wanna use that instead https://docs.crewai.com/how-to/Hierarchical/
        )

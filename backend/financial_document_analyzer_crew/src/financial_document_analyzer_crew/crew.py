from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task
from crewai.agents.agent_builder.base_agent import BaseAgent
from typing import List
# If you want to run a snippet of code before or after the crew starts,
# you can use the @before_kickoff and @after_kickoff decorators
# https://docs.crewai.com/concepts/crews#example-crew-class-with-decorators

@CrewBase
class FinancialDocumentAnalyzerCrew():
    """FinancialDocumentAnalyzerCrew crew"""

    agents: List[BaseAgent]
    tasks: List[Task]

    # Learn more about YAML configuration files here:
    # Agents: https://docs.crewai.com/concepts/agents#yaml-configuration-recommended
    # Tasks: https://docs.crewai.com/concepts/tasks#yaml-configuration-recommended
    
    # If you would like to add tools to your agents, you can learn more about it here:
    # https://docs.crewai.com/concepts/agents#agent-tools
    
    @agent
    def document_analyzer(self) -> Agent:
        """
        Financial Document Analyzer Agent
        Specializes in extracting and validating financial data from documents
        """
        return Agent(
            config=self.agents_config['document_analyzer'], # type: ignore[index]
            verbose=True,
            allow_delegation=False  # This agent focuses on document extraction only
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
            allow_delegation=False  # This agent focuses on financial analysis only
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
            allow_delegation=False  # This agent focuses on risk assessment only
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
            allow_delegation=False  # This agent synthesizes all previous work
        )

    # To learn more about structured task outputs,
    # task dependencies, and task callbacks, check out the documentation:
    # https://docs.crewai.com/concepts/tasks#overview-of-a-task
    
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
        # To learn how to add knowledge sources to your crew, check out the documentation:
        # https://docs.crewai.com/concepts/knowledge#what-is-knowledge

        return Crew(
            agents=self.agents, # Automatically created by the @agent decorator
            tasks=self.tasks, # Automatically created by the @task decorator
            process=Process.sequential,
            verbose=True,
            # process=Process.hierarchical, # In case you wanna use that instead https://docs.crewai.com/how-to/Hierarchical/
        )

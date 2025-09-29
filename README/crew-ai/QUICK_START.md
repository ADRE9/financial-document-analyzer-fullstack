# Quick Start Guide: Financial Document Analyzer Crew

## Overview

This guide helps you get started with the professionally designed CrewAI agents for financial document analysis.

## Prerequisites

1. **Python Environment**: Python 3.10+
2. **Dependencies**: Install CrewAI and required packages
3. **API Keys**: Set up your LLM provider API keys (OpenAI, Anthropic, Google, etc.)

## Installation

```bash
cd backend/financial_document_analyzer_crew

# Install dependencies using uv (recommended)
uv sync

# Or using pip
pip install -r requirements.txt
```

## Configuration

### 1. Set Up Environment Variables

Create a `.env` file in the `backend/financial_document_analyzer_crew` directory:

```bash
# LLM Provider Configuration
OPENAI_API_KEY=your_openai_api_key_here
# Or use other providers:
# ANTHROPIC_API_KEY=your_anthropic_key
# GOOGLE_API_KEY=your_google_key

# Optional: Model configuration
DEFAULT_LLM_MODEL=gpt-4o  # or claude-3-5-sonnet, gemini-pro, etc.
```

### 2. Update agents.yaml (if needed)

The agents are pre-configured with professional roles, goals, and backstories. You can specify the LLM model for each agent:

```yaml
document_analyzer:
  role: >
    Senior Financial Document Analyst...
  goal: >
    Extract, validate, and structure financial data...
  backstory: >
    You are a CFA charterholder...
  llm: openai/gpt-4o # Add this line to specify model
```

## Running the Crew

### Basic Usage

```python
from financial_document_analyzer_crew.crew import FinancialDocumentAnalyzerCrew

# Initialize the crew
crew = FinancialDocumentAnalyzerCrew()

# Run analysis on a financial document
result = crew.kickoff(inputs={
    'document_path': '/path/to/financial/document.pdf'
})

print(result)
```

### Using the Main Script

```bash
cd backend/financial_document_analyzer_crew

# Run the crew
python src/financial_document_analyzer_crew/main.py
```

### Running from the Root Directory

```bash
cd backend

# Run using the crew module
python -m financial_document_analyzer_crew.src.financial_document_analyzer_crew.main
```

## Understanding the Workflow

### 1. Document Analysis Task

- **Agent**: Document Analyzer
- **Input**: Path to financial document
- **Output**: Structured financial data with validation results
- **What it does**: Extracts and validates all financial metrics from the document

### 2. Financial Insights Task

- **Agent**: Financial Insights Analyst
- **Input**: Output from Document Analysis Task
- **Output**: Financial ratios and performance analysis
- **What it does**: Calculates key metrics and identifies trends

### 3. Risk Assessment Task

- **Agent**: Risk Assessment Specialist
- **Input**: Outputs from previous tasks
- **Output**: Comprehensive risk evaluation
- **What it does**: Assesses credit, liquidity, market, and operational risks

### 4. Investment Recommendation Task

- **Agent**: Investment Advisor
- **Input**: All previous outputs
- **Output**: Evidence-based investment recommendations
- **What it does**: Synthesizes analysis into actionable investment advice

### Final Output

The crew generates a comprehensive report: `investment_analysis_report.md`

## Example: Analyzing a Financial Statement

```python
from pathlib import Path
from financial_document_analyzer_crew.crew import FinancialDocumentAnalyzerCrew

# Path to your financial document
doc_path = Path("uploads/quarterly_report_Q4_2024.pdf")

# Create and run the crew
crew = FinancialDocumentAnalyzerCrew()

result = crew.kickoff(inputs={
    'document_path': str(doc_path)
})

# Access the final report
print("Analysis Complete!")
print(f"Report saved to: investment_analysis_report.md")
print("\nSummary:")
print(result)
```

## Customization

### Adding Custom Tools

You can add specialized tools to agents for enhanced capabilities:

```python
from crewai.tools import BaseTool
from financial_document_analyzer_crew.crew import FinancialDocumentAnalyzerCrew

# Create a custom PDF extraction tool
class PDFExtractionTool(BaseTool):
    name: str = "PDF Financial Data Extractor"
    description: str = "Extracts structured financial data from PDF documents"

    def _run(self, file_path: str) -> str:
        # Your PDF extraction logic here
        pass

# Add tool to agent
@agent
def document_analyzer(self) -> Agent:
    return Agent(
        config=self.agents_config['document_analyzer'],
        tools=[PDFExtractionTool()],  # Add custom tool
        verbose=True,
        allow_delegation=False
    )
```

### Adjusting Agent Behavior

Modify `agents.yaml` to fine-tune agent behavior:

```yaml
document_analyzer:
  role: >
    [Your custom role]
  goal: >
    [Your custom goal]
  backstory: >
    [Your custom backstory]
  llm: openai/gpt-4o
  max_iter: 5 # Increase iteration limit
  verbose: true
```

## Testing

### Unit Testing Individual Agents

```python
from financial_document_analyzer_crew.crew import FinancialDocumentAnalyzerCrew

crew = FinancialDocumentAnalyzerCrew()

# Test document analyzer
doc_analyzer = crew.document_analyzer()
print(f"Agent Role: {doc_analyzer.role}")
print(f"Agent Goal: {doc_analyzer.goal}")
```

### Integration Testing

```bash
# Run with a sample document
python src/financial_document_analyzer_crew/main.py --document sample_financial_statement.pdf
```

## Monitoring and Debugging

### Enable Verbose Logging

All agents are configured with `verbose=True` by default. You'll see:

- Agent reasoning process
- Tool usage
- Task execution steps
- Decision-making logic

### Add Custom Logging

```python
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# In your crew execution
result = crew.kickoff(inputs={
    'document_path': doc_path
})
logger.info(f"Analysis completed: {result}")
```

## Common Issues and Solutions

### Issue 1: "Config file not found"

**Solution**: Ensure you're running from the correct directory and `config/agents.yaml` exists

### Issue 2: "LLM API key not set"

**Solution**: Set your API key in environment variables or `.env` file

### Issue 3: "Agent not producing expected output"

**Solution**: Check the task's `expected_output` in `tasks.yaml` and ensure it matches your needs

### Issue 4: "Tasks taking too long"

**Solution**: Consider:

- Using faster models for initial agents (e.g., gpt-4o-mini)
- Reducing `max_iter` for agents
- Implementing caching for repeated analyses

## Best Practices

### 1. Document Preparation

- Ensure documents are in supported formats (PDF, TXT)
- Verify document quality (readable, not corrupted)
- Use clear, well-structured financial documents

### 2. Input Validation

- Validate file paths before processing
- Check file size limits
- Verify document type matches expected format

### 3. Output Handling

- Save outputs with timestamps
- Store both structured data and markdown reports
- Implement error handling for failed analyses

### 4. Performance Optimization

- Cache frequently analyzed documents
- Use appropriate model tiers (faster models for simple tasks)
- Implement parallel processing where applicable

## Integration with FastAPI Backend

To integrate with your FastAPI application:

```python
# In your FastAPI router
from financial_document_analyzer_crew.crew import FinancialDocumentAnalyzerCrew

@router.post("/analyze")
async def analyze_document(document_id: str):
    # Get document path from database
    document_path = get_document_path(document_id)

    # Run CrewAI analysis
    crew = FinancialDocumentAnalyzerCrew()
    result = crew.kickoff(inputs={
        'document_path': document_path
    })

    # Save results to database
    save_analysis_results(document_id, result)

    return {"status": "success", "result": result}
```

## Next Steps

1. ✅ **Test with Sample Documents**: Start with simple financial statements
2. ✅ **Add Custom Tools**: Enhance agents with specialized tools for your use case
3. ✅ **Integrate with API**: Connect CrewAI to your FastAPI backend
4. ✅ **Monitor Performance**: Track analysis quality and execution time
5. ✅ **Iterate and Improve**: Refine agent prompts based on results

## Resources

- **CrewAI Documentation**: https://docs.crewai.com
- **Agent Design Guide**: See `AGENT_DESIGN.md` in this directory
- **Transformation Guide**: See `AGENT_TRANSFORMATION.md` for best practices
- **Project Documentation**: See `/memory-bank/` directory

## Support

For issues or questions:

1. Check the documentation in this directory
2. Review agent configurations in `config/agents.yaml`
3. Enable verbose logging for debugging
4. Check CrewAI's official documentation

---

**Remember**: These agents are designed with professional standards, regulatory compliance, and reliable analysis in mind. Always review outputs for accuracy and suitability for your specific use case.

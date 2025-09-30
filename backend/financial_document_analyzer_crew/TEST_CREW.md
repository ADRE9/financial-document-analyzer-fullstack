# Testing the Financial Document Analyzer Crew

This guide explains how to test the CrewAI-based financial document analyzer.

## Prerequisites

1. **Environment Variables** - Ensure these are set in your `.env` file:

   ```bash
   # In backend/.env or backend/financial_document_analyzer_crew/.env
   SERPER_API_KEY=your_serper_api_key_here
   GOOGLE_API_KEY=your_gemini_api_key_here
   ```

2. **Install Dependencies**:

   ```bash
   cd /Users/arshad/Development/Fullstack/financial-document-analyzer/backend
   source venv/bin/activate
   pip install pdfplumber  # If not already installed
   ```

3. **Install the Crew Package** (optional, for crewai CLI):
   ```bash
   cd financial_document_analyzer_crew
   pip install -e .
   ```

## Available PDFs for Testing

The following PDF files are available in the `uploads/` directory:

- `39d1a31f-7b8d-4be2-87ff-9ad078c2f3a8.pdf`
- `53bfcb49-9280-4df1-a1ed-9872fef48702.pdf`

## Testing Methods

### Method 1: Using the Test Script (Recommended for Quick Testing)

```bash
cd /Users/arshad/Development/Fullstack/financial-document-analyzer/backend/financial_document_analyzer_crew

# Run with default PDF and query
python test_crew.py

# Run with specific PDF
python test_crew.py ../uploads/39d1a31f-7b8d-4be2-87ff-9ad078c2f3a8.pdf

# Run with specific PDF and custom query
python test_crew.py ../uploads/39d1a31f-7b8d-4be2-87ff-9ad078c2f3a8.pdf "What are the key revenue trends?"
```

### Method 2: Using CrewAI CLI (Preferred by CrewAI)

```bash
cd /Users/arshad/Development/Fullstack/financial-document-analyzer/backend/financial_document_analyzer_crew

# Run the crew using crewai CLI
crewai run
```

### Method 3: Using Python Directly

```bash
cd /Users/arshad/Development/Fullstack/financial-document-analyzer/backend

# Activate virtual environment
source venv/bin/activate

# Run Python script
python -c "
from financial_document_analyzer_crew.src.financial_document_analyzer_crew.main import run
result = run(
    document_path='uploads/39d1a31f-7b8d-4be2-87ff-9ad078c2f3a8.pdf',
    query='What is the overall financial health of this company?'
)
print(result)
"
```

## Expected Workflow

The crew will execute 4 sequential tasks:

1. **Document Verification Task** (Document Analyzer Agent)

   - Validates if the document is a financial document
   - Extracts financial data
   - Checks confidence score (must be >= 30%)
   - If validation fails, stops the workflow

2. **Financial Insights Task** (Financial Insights Analyst)

   - Calculates financial ratios
   - Identifies trends and patterns
   - Assesses financial health

3. **Risk Assessment Task** (Risk Assessment Specialist)

   - Evaluates credit, liquidity, and solvency risks
   - Provides risk ratings and warnings
   - Recommends mitigation strategies

4. **Investment Recommendation Task** (Investment Advisor)
   - Synthesizes all analyses
   - Provides investment recommendations
   - Generates final report saved to `investment_analysis_report.md`

## Expected Output

The crew will:

- Print verbose logs showing agent thinking and tool usage
- Generate a comprehensive investment analysis report
- Save the final report to `investment_analysis_report.md`

## Troubleshooting

### Error: "pdfplumber not found"

```bash
pip install pdfplumber
```

### Error: "SERPER_API_KEY not set"

Add to `.env` file:

```bash
SERPER_API_KEY=your_api_key_here
```

### Error: "GOOGLE_API_KEY not set"

Add to `.env` file:

```bash
GOOGLE_API_KEY=your_gemini_api_key_here
```

### Error: "Module not found: financial_document_analyzer_crew"

```bash
cd financial_document_analyzer_crew
pip install -e .
```

## Verification

After running the crew, you should see:

1. Agent logs showing the analysis process
2. A final result printed to console
3. A file named `investment_analysis_report.md` in the current directory

## Notes

- The crew uses `gemini/gemini-2.0-flash` as the LLM
- The crew runs in `sequential` process mode
- Each agent has specific tools:
  - Document Analyzer: FinancialDocumentTool
  - Financial Insights Analyst: SerperDevTool (for benchmarking)
  - Risk Assessment Specialist: SerperDevTool (for market research)
  - Investment Advisor: SerperDevTool (for investment research)

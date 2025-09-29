#!/usr/bin/env python3
"""
Test script to verify document validation works correctly.
This script tests the validation gate to ensure non-financial documents are rejected.
"""

import os
import sys
import tempfile
from pathlib import Path

# Add the crew directory to Python path
crew_path = Path(__file__).parent / "financial_document_analyzer_crew" / "src"
sys.path.insert(0, str(crew_path))

def create_test_documents():
    """Create test documents to verify validation."""
    
    # Create temporary directory for test files
    test_dir = Path(__file__).parent / "test_documents"
    test_dir.mkdir(exist_ok=True)
    
    # Create a non-financial document (should fail validation)
    non_financial_content = """
    Recipe for Chocolate Cake
    
    Ingredients:
    - 2 cups flour
    - 1 cup sugar
    - 3 eggs
    - 1/2 cup butter
    - 1 cup milk
    - 2 tbsp cocoa powder
    
    Instructions:
    1. Preheat oven to 350°F
    2. Mix dry ingredients
    3. Add wet ingredients
    4. Bake for 30 minutes
    
    This is clearly not a financial document and should be rejected by the validation system.
    """
    
    non_financial_file = test_dir / "recipe.txt"
    with open(non_financial_file, 'w') as f:
        f.write(non_financial_content)
    
    # Create a mock financial document (should pass validation)
    financial_content = """
    XYZ Corporation
    Annual Financial Report 2023
    
    BALANCE SHEET
    As of December 31, 2023
    
    ASSETS
    Current Assets:
    Cash and cash equivalents        $1,250,000
    Accounts receivable             $2,100,000  
    Inventory                       $1,800,000
    Total Current Assets            $5,150,000
    
    Non-Current Assets:
    Property, plant & equipment     $8,500,000
    Intangible assets              $1,200,000
    Total Non-Current Assets        $9,700,000
    
    TOTAL ASSETS                   $14,850,000
    
    LIABILITIES AND EQUITY
    Current Liabilities:
    Accounts payable               $1,400,000
    Short-term debt                  $800,000
    Total Current Liabilities       $2,200,000
    
    Long-term debt                  $4,500,000
    Total Liabilities               $6,700,000
    
    Shareholders' Equity:
    Common stock                    $2,000,000
    Retained earnings              $6,150,000
    Total Shareholders' Equity      $8,150,000
    
    TOTAL LIABILITIES AND EQUITY   $14,850,000
    
    INCOME STATEMENT
    For the year ended December 31, 2023
    
    Revenue                        $18,500,000
    Cost of goods sold            $12,200,000
    Gross profit                   $6,300,000
    
    Operating expenses             $4,800,000
    Operating income               $1,500,000
    
    Interest expense                 $180,000
    Net income                     $1,320,000
    
    Earnings per share (EPS)            $2.64
    """
    
    financial_file = test_dir / "financial_report.txt"
    with open(financial_file, 'w') as f:
        f.write(financial_content)
    
    return str(non_financial_file), str(financial_file)

def test_document_validation():
    """Test the document validation functionality."""
    
    print("🧪 Testing Document Validation System")
    print("=" * 50)
    
    try:
        from financial_document_analyzer_crew.tools import FinancialDocumentTool
        
        # Create test documents
        non_financial_path, financial_path = create_test_documents()
        
        # Initialize the tool
        tool = FinancialDocumentTool()
        
        # Test 1: Non-financial document (should fail)
        print("\n📋 Test 1: Non-financial document (Recipe)")
        print(f"File: {non_financial_path}")
        
        result1 = tool._run(non_financial_path)
        print("Result:", result1[:200] + "..." if len(result1) > 200 else result1)
        
        import json
        try:
            parsed1 = json.loads(result1)
            is_financial1 = parsed1.get("is_financial_document", False)
            confidence1 = parsed1.get("confidence_score", 0)
            
            if not is_financial1:
                print("✅ PASS: Non-financial document correctly rejected")
                print(f"   Confidence: {confidence1}%")
            else:
                print("❌ FAIL: Non-financial document incorrectly accepted")
        except json.JSONDecodeError:
            print("❌ FAIL: Could not parse validation result")
        
        # Test 2: Financial document (should pass)
        print("\n📊 Test 2: Financial document (Annual Report)")
        print(f"File: {financial_path}")
        
        result2 = tool._run(financial_path)
        print("Result:", result2[:200] + "..." if len(result2) > 200 else result2)
        
        try:
            parsed2 = json.loads(result2)
            is_financial2 = parsed2.get("is_financial_document", False)
            confidence2 = parsed2.get("confidence_score", 0)
            
            if is_financial2:
                print("✅ PASS: Financial document correctly accepted")
                print(f"   Confidence: {confidence2}%")
            else:
                print("❌ FAIL: Financial document incorrectly rejected")
                print(f"   Confidence: {confidence2}%")
        except json.JSONDecodeError:
            print("❌ FAIL: Could not parse validation result")
        
        # Test 3: Non-existent file (should error)
        print("\n🚫 Test 3: Non-existent file")
        result3 = tool._run("/path/to/nonexistent/file.pdf")
        print("Result:", result3[:200] + "..." if len(result3) > 200 else result3)
        
        try:
            parsed3 = json.loads(result3)
            if parsed3.get("status") == "error":
                print("✅ PASS: Non-existent file correctly handled as error")
            else:
                print("❌ FAIL: Non-existent file should return error")
        except json.JSONDecodeError:
            print("❌ FAIL: Could not parse error result")
    
    except ImportError as e:
        print(f"❌ FAIL: Could not import CrewAI tools: {e}")
        print("Make sure CrewAI dependencies are installed")
    
    except Exception as e:
        print(f"❌ FAIL: Unexpected error: {e}")
    
    print("\n" + "=" * 50)
    print("🏁 Test Complete")

if __name__ == "__main__":
    test_document_validation()

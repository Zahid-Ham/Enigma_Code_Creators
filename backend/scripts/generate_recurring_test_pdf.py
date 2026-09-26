"""Generator for the FINCLOSURE Multi-Month Recurring Transactions Test PDF."""

from pathlib import Path
import pymupdf


def create_recurring_transactions_pdf(output_path: str | Path) -> str:
    """Generates a 6-month synthetic bank statement PDF with 5 recurring relationships

    and 1 isolated transaction, followed by a ground-truth documentation page.
    """
    doc = pymupdf.open()

    # Page 1: Bank Statement Summary & Months 1-3 (April - June 2026)
    page1 = doc.new_page(width=595, height=842)
    p1_text = """SUMMIT NATIONAL BANK
SAVINGS ACCOUNT STATEMENT
Account Number: XXXX XXXX 4582 | Customer: Arjun Mehta
Statement Period: 01-Apr-2026 to 30-Sep-2026 | Currency: INR (₹)
Branch: Connaught Place, New Delhi | IFSC: SNBK0004582

-------------------------------------------------------------------------------------------------------------
TRANSACTION ACTIVITY RECORD (Part 1: April 2026 - June 2026)
-------------------------------------------------------------------------------------------------------------
Date          Description / Narrative                     Amount (INR)    Type    Balance (INR)
-------------------------------------------------------------------------------------------------------------
01-Apr-2026   OPENING BALANCE FORWARD                                             4,85,200.00
04-Apr-2026   ABC LIFE INSURANCE / PREMIUM ECS                4,250.00    DR      4,80,950.00
05-Apr-2026   NATIONAL HOUSING BANK — HOME LOAN EMI          28,600.00    DR      4,52,350.00
10-Apr-2026   CITY POWER — ELECTRICITY BILL                   2,340.00    DR      4,50,010.00
12-Apr-2026   STREAMFLIX DIGITAL SERVICES                       699.00    DR      4,49,311.00
15-Apr-2026   GREENWOOD ASSET MANAGEMENT — MONTHLY SIP       10,000.00    DR      4,39,311.00
-------------------------------------------------------------------------------------------------------------
04-May-2026   ABC LIFE INSURANCE PREMIUM                      4,250.00    DR      4,35,061.00
05-May-2026   NATIONAL HOUSING BANK HOME LOAN — EMI          28,600.00    DR      4,06,461.00
10-May-2026   CITY POWER — ELECTRICITY BILL                   2,510.00    DR      4,03,951.00
12-May-2026   STREAMFLIX — MONTHLY SUBSCRIPTION                 699.00    DR      4,03,252.00
15-May-2026   GREENWOOD MF — MONTHLY SIP                     10,000.00    DR      3,93,252.00
15-May-2026   SECUREHEALTH INSURANCE - ONE TIME RENEWAL       6,500.00    DR      3,86,752.00
-------------------------------------------------------------------------------------------------------------
04-Jun-2026   ABC LIFE INSURANCE — PREMIUM                    4,250.00    DR      3,82,502.00
05-Jun-2026   NATIONAL HOUSING BANK — EMI                    28,600.00    DR      3,53,902.00
10-Jun-2026   CITY POWER — ELECTRICITY BILL                   2,420.00    DR      3,51,482.00
12-Jun-2026   STREAMFLIX MONTHLY PLAN                           699.00    DR      3,50,783.00
15-Jun-2026   GREENWOOD ASSET MANAGEMENT — SIP               10,000.00    DR      3,40,783.00
-------------------------------------------------------------------------------------------------------------
"""
    page1.insert_text((40, 50), p1_text, fontsize=9.5, fontname="courier")

    # Page 2: Months 4-6 (July - September 2026) & Closing Summary
    page2 = doc.new_page(width=595, height=842)
    p2_text = """SUMMIT NATIONAL BANK
SAVINGS ACCOUNT STATEMENT (Continued)
Account Number: XXXX XXXX 4582 | Customer: Arjun Mehta

-------------------------------------------------------------------------------------------------------------
TRANSACTION ACTIVITY RECORD (Part 2: July 2026 - September 2026)
-------------------------------------------------------------------------------------------------------------
Date          Description / Narrative                     Amount (INR)    Type    Balance (INR)
-------------------------------------------------------------------------------------------------------------
04-Jul-2026   ABC LIFE INSURANCE / PREMIUM ECS                4,250.00    DR      3,36,533.00
05-Jul-2026   NATIONAL HOUSING BANK — HOME LOAN EMI          28,600.00    DR      3,07,933.00
10-Jul-2026   CITY POWER — ELECTRICITY BILL                   2,680.00    DR      3,05,253.00
12-Jul-2026   STREAMFLIX DIGITAL SERVICES                       699.00    DR      3,04,554.00
15-Jul-2026   GREENWOOD ASSET MANAGEMENT — MONTHLY SIP       10,000.00    DR      2,94,554.00
-------------------------------------------------------------------------------------------------------------
04-Aug-2026   ABC LIFE INSURANCE PREMIUM                      4,250.00    DR      2,90,304.00
05-Aug-2026   NATIONAL HOUSING BANK HOME LOAN — EMI          28,600.00    DR      2,61,704.00
10-Aug-2026   CITY POWER — ELECTRICITY BILL                   2,560.00    DR      2,59,144.00
12-Aug-2026   STREAMFLIX — MONTHLY SUBSCRIPTION                 699.00    DR      2,58,445.00
15-Aug-2026   GREENWOOD MF — MONTHLY SIP                     10,000.00    DR      2,48,445.00
-------------------------------------------------------------------------------------------------------------
04-Sep-2026   ABC LIFE INSURANCE — PREMIUM                    4,250.00    DR      2,44,195.00
05-Sep-2026   NATIONAL HOUSING BANK — EMI                    28,600.00    DR      2,15,595.00
10-Sep-2026   CITY POWER — ELECTRICITY BILL                   2,410.00    DR      2,13,185.00
12-Sep-2026   STREAMFLIX MONTHLY PLAN                           699.00    DR      2,12,486.00
15-Sep-2026   GREENWOOD ASSET MANAGEMENT — SIP               10,000.00    DR      2,02,486.00
-------------------------------------------------------------------------------------------------------------
30-Sep-2026   CLOSING BALANCE CARRIED FORWARD                             CR      3,54,415.00
-------------------------------------------------------------------------------------------------------------
"""
    page2.insert_text((40, 50), p2_text, fontsize=9.5, fontname="courier")

    # Page 3: Ground-Truth Documentation (Excluded during extraction as per spec)
    page3 = doc.new_page(width=595, height=842)
    p3_text = """FINCLOSURE TEST BENCHMARK SPECIFICATION
Expected Analysis (Documentation / Ground-Truth Reference ONLY)

1. ABC Life Insurance
   - Occurrences: 6
   - Cadence: Monthly
   - Amount: ₹4,250 (Fixed)
   - Category: Insurance Premium
   - Strength: Strong

2. National Housing Bank
   - Occurrences: 6
   - Cadence: Monthly
   - Amount: ₹28,600 (Fixed)
   - Category: Loan EMI
   - Strength: Strong

3. Greenwood Asset Management
   - Occurrences: 6
   - Cadence: Monthly
   - Amount: ₹10,000 (Fixed)
   - Category: Investment SIP
   - Strength: Strong

4. Streamflix
   - Occurrences: 6
   - Cadence: Monthly
   - Amount: ₹699 (Fixed)
   - Category: Digital Subscription
   - Strength: Strong

5. City Power
   - Occurrences: 6
   - Cadence: Monthly
   - Amount: Variable (~₹2,486)
   - Category: Utility
   - Strength: Strong

6. SecureHealth Insurance
   - Occurrences: 1
   - Cadence: Irregular / None
   - Amount: ₹6,500
   - Strength: Insufficient (Single isolated transaction)
"""
    page3.insert_text((40, 50), p3_text, fontsize=10, fontname="helvetica")

    out = Path(output_path)
    out.parent.mkdir(parents=True, exist_ok=True)
    doc.save(str(out))
    doc.close()
    return str(out)


if __name__ == "__main__":
    p = create_recurring_transactions_pdf("data/samples/FINCLOSURE_Recurring_Transactions_Test.pdf")
    print(f"Created: {p}")

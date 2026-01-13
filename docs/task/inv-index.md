# Inventory Management Enhancement Tasks

## Overview
This directory contains 7 separate tasks for enhancing the inventory management system. Each task is independent and can be executed separately using the `adw_chore_implement` workflow.

## Task List

### Priority 1: Foundation
1. **[inv-1-header-cleanup.md](./inv-1-header-cleanup.md)** - Remove 'Organization' and 'Profile' from header
   - Complexity: Low
   - Estimated time: 30 minutes
   - Dependencies: None

### Priority 2: Inventory Detail Enhancements
2. **[inv-2-allocate-transactions.md](./inv-2-allocate-transactions.md)** - Add allocation transactions section
   - Complexity: Medium
   - Estimated time: 2-3 hours
   - Dependencies: None

3. **[inv-3-transaction-history.md](./inv-3-transaction-history.md)** - Add comprehensive transaction history
   - Complexity: High
   - Estimated time: 4-6 hours
   - Dependencies: None

### Priority 3: Inventory Management Filtering
4. **[inv-4-view-filtering.md](./inv-4-view-filtering.md)** - Implement mandatory view filtering
   - Complexity: Medium
   - Estimated time: 2-3 hours
   - Dependencies: None

### Priority 4: New Fields
5. **[inv-5-item-type.md](./inv-5-item-type.md)** - Add Item Type field (Normal, Pack, Weight, Pack Weight)
   - Complexity: Medium
   - Estimated time: 2-3 hours
   - Dependencies: Task 4 (view filtering)

6. **[inv-6-uom-field.md](./inv-6-uom-field.md)** - Add UOM (Unit of Measurement) field
   - Complexity: Medium
   - Estimated time: 2-3 hours
   - Dependencies: Task 4 (view filtering)

### Priority 5: Advanced Configuration
7. **[inv-7-stock-config-channel.md](./inv-7-stock-config-channel.md)** - Add Stock Config by Channel
   - Complexity: High
   - Estimated time: 4-6 hours
   - Dependencies: Tasks 5 & 6 (Item Type and UOM)

## Execution Order

### Recommended Sequence
```
Task 1 (Header) → Can be done anytime
Task 2 (Allocate Transactions) → Independent
Task 3 (Transaction History) → Independent
Task 4 (View Filtering) → Required before Tasks 5 & 6
Task 5 (Item Type) → After Task 4
Task 6 (UOM) → After Task 4
Task 7 (Stock Config by Channel) → After Tasks 5 & 6
```

### Parallel Execution Possible
- **Group A**: Task 1 (Header cleanup)
- **Group B**: Tasks 2 & 3 (Inventory Detail enhancements)
- **Group C**: Task 4 (View filtering) → Then Tasks 5 & 6 (New fields) → Then Task 7 (Stock Config)

## Quick Execution

### Execute Single Task
```bash
# Task 1
./adws/adw_chore_implement.py "$(cat docs/task/inv-1-header-cleanup.md | grep -A 1000 '## Requirements')" --model sonnet

# Task 2
./adws/adw_chore_implement.py "$(cat docs/task/inv-2-allocate-transactions.md | grep -A 1000 '## Requirements')" --model opus

# Task 3
./adws/adw_chore_implement.py "$(cat docs/task/inv-3-transaction-history.md | grep -A 1000 '## Requirements')" --model opus

# Task 4
./adws/adw_chore_implement.py "$(cat docs/task/inv-4-view-filtering.md | grep -A 1000 '## Requirements')" --model opus

# Task 5
./adws/adw_chore_implement.py "$(cat docs/task/inv-5-item-type.md | grep -A 1000 '## Requirements')" --model opus

# Task 6
./adws/adw_chore_implement.py "$(cat docs/task/inv-6-uom-field.md | grep -A 1000 '## Requirements')" --model opus

# Task 7
./adws/adw_chore_implement.py "$(cat docs/task/inv-7-stock-config-channel.md | grep -A 1000 '## Requirements')" --model opus
```

### Or Use the ADW Execution Command in Each File
Each task file includes an "ADW Execution" section at the bottom with a ready-to-use command.

## Progress Tracking

### Task Status
- [x] Task 1: Header Cleanup ✅ COMPLETED (ADW: 0e049998)
- [x] Task 2: Allocate by Order Transactions ✅ COMPLETED (ADW: d848eedc)
- [x] Task 3: Available Transaction History ✅ COMPLETED (ADW: b9383718)
- [x] Task 4: View Filtering ✅ COMPLETED (ADW: 18db0b79)
- [x] Task 5: Item Type Field ✅ COMPLETED
- [x] Task 6: UOM Field ✅ COMPLETED
- [x] Task 7: Stock Config by Channel ✅ COMPLETED

### Completion Checklist
After completing all tasks:
- [x] All 7 tasks implemented successfully ✅
- [ ] Integration testing completed
- [ ] Mobile responsiveness verified
- [ ] Performance optimization done
- [ ] Documentation updated
- [ ] User acceptance testing passed

**Completion Date**: 2026-01-13
**Execution Method**: Multi-session parallel with `adw_chore_implement.py`
**Total Execution Time**: ~3 hours
**Model Used**: Claude Opus 4.5
**Success Rate**: 100% (7/7 tasks completed)

## Notes
- Each task file contains detailed requirements, data structures, UI components, and success criteria
- Use `sonnet` model for simple tasks (Task 1)
- Use `opus` model for complex tasks (Tasks 2-7)
- Test each task individually before moving to the next
- Follow the git commit rules in CLAUDE.md (always test before committing)

---

**Generated**: 2026-01-13
**Target System**: Omnia-UI / RIS OMS
**Workflow**: adw_chore_implement

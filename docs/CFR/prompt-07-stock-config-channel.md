# Prompt 7: Stock Config - Channel Field Addition

Add Channel field to Stock Configuration:

## Requirement
- Add 'Channel' field to stock configuration
- Supported channels: **TOL, MKP, QC**

## Multi-Channel Handling
- If configuring for more than 1 channel, create separate rows per channel
- Each channel gets its own configuration row
- Example: If item configured for TOL and MKP, show 2 separate rows

## UI Implementation
- Add Channel column to stock config table
- Add Channel selector when creating/editing config
- Allow multi-select for channels (creates multiple rows)

## Channel Values
| Channel Code | Description |
|--------------|-------------|
| TOL | Tops Online |
| MKP | Marketplace |
| QC | Quality Control / Quick Commerce |

## Files to investigate:
- app/stock-config/ - Stock config page
- src/components/stock-config/ - Stock config components
- src/types/ - Type definitions

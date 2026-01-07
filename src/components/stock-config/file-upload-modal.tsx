"use client"

import { useState, useRef, useCallback, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Upload,
  FileSpreadsheet,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileUp,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
} from "lucide-react"
import { parseStockConfigFile, validateFilePreSubmission } from "@/lib/stock-config-service"
import type { FileParseResult, ParsedStockConfigRow, PreSubmissionValidationResult } from "@/types/stock-config"

interface FileUploadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUploadComplete: (result: FileParseResult, validRows: ParsedStockConfigRow[]) => void
  onReviewResults: (result: FileParseResult) => void
  onStartProcessing: (result: FileParseResult) => void
}

type UploadStep = 1 | 2 | 3 | 4
type UploadState = "idle" | "parsing" | "validating" | "validated" | "ready" | "error"

const STEP_LABELS = ["Select File", "Validate", "Review", "Submit"]

export function FileUploadModal({
  open,
  onOpenChange,
  onUploadComplete,
  onReviewResults,
  onStartProcessing,
}: FileUploadModalProps) {
  const [dragOver, setDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadState, setUploadState] = useState<UploadState>("idle")
  const [currentStep, setCurrentStep] = useState<UploadStep>(1)
  const [parseResult, setParseResult] = useState<FileParseResult | null>(null)
  const [validationResult, setValidationResult] = useState<PreSubmissionValidationResult | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showValidationErrors, setShowValidationErrors] = useState(false)
  const [proceedWithWarnings, setProceedWithWarnings] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const acceptedTypes = [
    ".csv",
    ".xlsx",
    ".xls",
    "text/csv",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
  ]

  const resetState = useCallback(() => {
    setSelectedFile(null)
    setUploadState("idle")
    setCurrentStep(1)
    setParseResult(null)
    setValidationResult(null)
    setErrorMessage(null)
    setDragOver(false)
    setShowValidationErrors(false)
    setProceedWithWarnings(false)
  }, [])

  const handleClose = useCallback(() => {
    resetState()
    onOpenChange(false)
  }, [resetState, onOpenChange])

  const isValidFileType = (file: File): boolean => {
    const extension = `.${file.name.split(".").pop()?.toLowerCase()}`
    return acceptedTypes.includes(extension) || acceptedTypes.includes(file.type)
  }

  const handleFile = async (file: File) => {
    if (!isValidFileType(file)) {
      setErrorMessage("Invalid file type. Please upload a CSV or Excel file (.csv, .xlsx, .xls)")
      setUploadState("error")
      return
    }

    setSelectedFile(file)
    setUploadState("parsing")
    setErrorMessage(null)

    try {
      const result = await parseStockConfigFile(file)
      setParseResult(result)
      setCurrentStep(2)
      setUploadState("validating")

      // Run pre-submission validation
      const validation = validateFilePreSubmission(result.rows)
      setValidationResult(validation)
      setUploadState("validated")
      setCurrentStep(3)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to parse file")
      setUploadState("error")
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleChooseFile = () => {
    fileInputRef.current?.click()
  }

  const handleRemoveFile = () => {
    resetState()
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleReview = () => {
    if (parseResult) {
      onReviewResults(parseResult)
    }
  }

  const handleProceedToSubmit = () => {
    if (validationResult && !validationResult.isValid) {
      setProceedWithWarnings(true)
    }
    setCurrentStep(4)
    setUploadState("ready")
  }

  const handleBackToReview = () => {
    setCurrentStep(3)
    setUploadState("validated")
  }

  const handleSubmitForProcessing = () => {
    if (!parseResult) return
    onStartProcessing(parseResult)
    handleClose()
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  // Group validation errors by row
  const errorsByRow = useMemo(() => {
    if (!validationResult) return new Map<number, PreSubmissionValidationResult["errors"]>()
    const grouped = new Map<number, PreSubmissionValidationResult["errors"]>()
    validationResult.errors.forEach((error) => {
      const existing = grouped.get(error.row) || []
      existing.push(error)
      grouped.set(error.row, existing)
    })
    return grouped
  }, [validationResult])

  const canSubmit = validationResult?.isValid || proceedWithWarnings

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-w-[95vw] max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Stock Configuration
          </DialogTitle>
          <DialogDescription>
            Upload a CSV or Excel file containing stock configuration data
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator - Compact */}
        <div className="flex items-center justify-center py-3 border-b text-xs sm:text-sm text-muted-foreground flex-shrink-0">
          <span className="font-medium text-foreground">Step {currentStep}</span>
          <span className="mx-1">of</span>
          <span>4</span>
          <span className="mx-2">•</span>
          <span className="font-medium text-foreground truncate max-w-[100px] sm:max-w-none">{STEP_LABELS[currentStep - 1]}</span>
        </div>

        <div className="space-y-4 py-4 flex-1 overflow-y-auto min-h-0">
          {/* Step 1: File Selection */}
          {currentStep === 1 && (
            <>
              {uploadState === "idle" || uploadState === "error" ? (
                <div
                  className={`
                    border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
                    ${dragOver
                      ? "border-blue-500 bg-blue-50"
                      : errorMessage
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                    }
                  `}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={handleChooseFile}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={acceptedTypes.join(",")}
                    className="hidden"
                    onChange={handleFileInputChange}
                  />

                  <div className="flex flex-col items-center gap-3">
                    {dragOver ? (
                      <>
                        <FileUp className="h-10 w-10 text-blue-500" />
                        <p className="text-blue-600 font-medium">Drop file here</p>
                      </>
                    ) : errorMessage ? (
                      <>
                        <AlertCircle className="h-10 w-10 text-red-500" />
                        <p className="text-red-600 font-medium">{errorMessage}</p>
                        <p className="text-sm text-gray-500">Click or drag to try again</p>
                      </>
                    ) : (
                      <>
                        <FileSpreadsheet className="h-10 w-10 text-gray-400" />
                        <p className="text-gray-600 font-medium">Drag files here</p>
                        <p className="text-sm text-gray-500">or click to browse</p>
                        <Button variant="outline" size="sm" type="button">
                          Choose files to upload
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ) : null}

              {uploadState === "parsing" && (
                <div className="border rounded-lg p-6 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
                  <p className="mt-3 text-gray-600">Parsing file...</p>
                </div>
              )}

              {uploadState === "validating" && (
                <div className="border rounded-lg p-6 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
                  <p className="mt-3 text-gray-600">Validating data...</p>
                </div>
              )}
            </>
          )}

          {/* Steps 2-4: Show file info and validation */}
          {currentStep >= 2 && selectedFile && parseResult && (
            <div className="space-y-4">
              {/* File Info */}
              <div className="border rounded-lg p-3 sm:p-4 overflow-hidden">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <FileSpreadsheet className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 text-sm sm:text-base truncate" title={selectedFile.name}>{selectedFile.name}</p>
                      <p className="text-xs sm:text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                    </div>
                  </div>
                  {currentStep < 4 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleRemoveFile}
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Validation Summary (Steps 3-4) */}
              {currentStep >= 3 && validationResult && (
                <div className="border rounded-lg p-3 sm:p-4 space-y-3">
                  <h4 className="font-medium text-gray-900 text-sm sm:text-base">Validation Summary</h4>

                  <div className="grid grid-cols-3 gap-1 sm:gap-1.5 text-center">
                    <div className="bg-gray-50 rounded-lg p-1.5 sm:p-2">
                      <p className="text-base sm:text-lg font-bold text-gray-900">{validationResult.totalRows}</p>
                      <p className="text-[10px] sm:text-xs text-gray-500">Total</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-1.5 sm:p-2">
                      <p className="text-base sm:text-lg font-bold text-green-600">{validationResult.validRows}</p>
                      <p className="text-[10px] sm:text-xs text-gray-500">Valid</p>
                    </div>
                    <div className={`rounded-lg p-1.5 sm:p-2 ${validationResult.invalidRows > 0 ? "bg-red-50" : "bg-gray-50"}`}>
                      <p className={`text-base sm:text-lg font-bold ${validationResult.invalidRows > 0 ? "text-red-600" : "text-gray-400"}`}>{validationResult.invalidRows}</p>
                      <p className="text-[10px] sm:text-xs text-gray-500">Invalid</p>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {validationResult.isValid ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        All records valid - Ready to process
                      </Badge>
                    ) : validationResult.validRows > 0 ? (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {validationResult.invalidRows} records have errors
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        All records have errors
                      </Badge>
                    )}

                    {validationResult.warnings.length > 0 && (
                      <Badge className="bg-blue-100 text-blue-800">
                        {validationResult.warnings.length} warnings
                      </Badge>
                    )}
                  </div>

                  {/* Expandable Validation Errors */}
                  {validationResult.invalidRows > 0 && (
                    <Collapsible open={showValidationErrors} onOpenChange={setShowValidationErrors}>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-full justify-between">
                          <span>View Validation Errors</span>
                          {showValidationErrors ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-2">
                        <div className="max-h-48 overflow-auto border rounded-lg">
                          {Array.from(errorsByRow.entries()).slice(0, 10).map(([rowNum, errors]) => (
                            <div key={rowNum} className="p-2 border-b last:border-b-0 bg-red-50">
                              <p className="font-medium text-sm text-red-800">Row {rowNum}</p>
                              <ul className="text-xs text-red-700 mt-1 space-y-0.5">
                                {errors.map((err, i) => (
                                  <li key={i}>• {err.field}: {err.message}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                          {errorsByRow.size > 10 && (
                            <div className="p-2 text-center text-sm text-gray-500">
                              And {errorsByRow.size - 10} more rows with errors...
                            </div>
                          )}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  )}
                </div>
              )}

              {/* Step 4: Submit Confirmation */}
              {currentStep === 4 && (
                <div className="border rounded-lg p-4 bg-blue-50">
                  <h4 className="font-medium text-blue-900 mb-2">Ready to Process</h4>
                  <p className="text-sm text-blue-800">
                    {validationResult?.isValid ? (
                      `All ${validationResult.totalRows} rows are valid and will be processed.`
                    ) : (
                      <>
                        <AlertTriangle className="h-4 w-4 inline mr-1" />
                        {validationResult?.validRows} valid rows will be processed.
                        {validationResult?.invalidRows} invalid rows will be skipped.
                      </>
                    )}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex-shrink-0 flex-col sm:flex-row gap-2 pt-2 border-t mt-auto">
          {/* Step 1 */}
          {currentStep === 1 && (
            <Button variant="outline" onClick={handleClose} size="sm">
              Cancel
            </Button>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && parseResult && validationResult && (
            <div className="flex flex-wrap items-center justify-end gap-2 w-full">
              <Button variant="outline" onClick={handleRemoveFile} size="sm" className="flex-shrink-0">
                <ArrowLeft className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Change</span>
              </Button>
              <Button variant="outline" onClick={handleReview} size="sm" className="flex-shrink-0">
                Review
              </Button>
              {validationResult.isValid ? (
                <Button onClick={handleProceedToSubmit} size="sm" className="flex-shrink-0">
                  Proceed
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              ) : validationResult.validRows > 0 ? (
                <Button onClick={handleProceedToSubmit} variant="outline" size="sm" className="flex-shrink-0">
                  Proceed
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button variant="outline" onClick={handleRemoveFile} size="sm" className="flex-shrink-0">
                  Re-upload
                </Button>
              )}
            </div>
          )}

          {/* Step 4: Submit */}
          {currentStep === 4 && parseResult && validationResult && (
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:justify-end">
              <Button variant="outline" onClick={handleBackToReview} size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <Button onClick={handleSubmitForProcessing} disabled={!canSubmit} size="sm">
                <Upload className="h-4 w-4 mr-1" />
                Submit for Processing
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { consolidateInstallationsByUnitV2 } from "@/lib/utils/aerator-helpers"
import { ReportProvider } from "@/lib/report-context"

function ReportPageContent() {
  const [installationData, setInstallationData] = useState<any[]>([])
  const [formData, setFormData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    try {
      const storedInstallationData = localStorage.getItem("installationData")
      const storedFormData = localStorage.getItem("reportFormData")
      
      if (!storedInstallationData || !storedFormData) {
        console.log("Missing data, redirecting to home")
        router.push("/")
        return
      }

      const rawData = JSON.parse(storedInstallationData)
      // Apply consolidation logic to fix the (2) issue
      const consolidatedData = consolidateInstallationsByUnitV2(rawData)
      
      setInstallationData(consolidatedData)
      setFormData(JSON.parse(storedFormData))
    } catch (error) {
      console.error("Error loading data:", error)
      router.push("/")
    } finally {
      setLoading(false)
    }
  }, [router])

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center"><p>Loading report...</p></div>
  }

  if (!formData || installationData.length === 0) {
    return <div className="flex min-h-screen items-center justify-center"><p>No data found. Redirecting...</p></div>
  }

  // Split data into pages for proper report formatting
  const itemsPerPage = 15
  const dataPages = []
  for (let i = 0; i < installationData.length; i += itemsPerPage) {
    dataPages.push(installationData.slice(i, i + itemsPerPage))
  }

  // Get all column headers from the data
  const allHeaders = installationData.length > 0 ? Object.keys(installationData[0]) : []
  const displayHeaders = allHeaders.slice(0, 8) // Show first 8 columns

  return (
    <div className="flex min-h-screen flex-col items-center bg-gray-100 p-4">
      {/* Control buttons */}
      <div className="no-print mb-4 flex w-full max-w-4xl justify-end space-x-2">
        <Button onClick={() => window.print()}>Print Report</Button>
        <Button onClick={() => router.push("/data-form")} variant="outline">Edit Info</Button>
        <Button onClick={() => router.push("/")} variant="outline">Upload New File</Button>
      </div>

      <div className="report-container w-full max-w-4xl bg-white shadow-lg print:shadow-none">
        
        {/* Cover Page */}
        <div className="print-section report-page">
          <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
            <div className="mb-12">
              <Image src="/images/greenlight-logo.png" alt="Greenlight Logo" width={200} height={200} />
            </div>

            <h1 className="mb-4 text-6xl font-bold text-[#28a745]">
              Water Conservation Installation Report
            </h1>

            <h2 className="mb-12 text-3xl font-semibold text-gray-700">
              {formData.clientName}
            </h2>

            <div className="mt-auto text-gray-600">
              <p className="text-xl">Prepared By: {formData.preparedBy}</p>
              <p className="text-xl">Date: {new Date(formData.reportDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Letter Page */}
        <div className="print-section report-page">
          <div className="p-8">
            <div className="mb-8 flex items-center justify-between">
              <Image src="/images/greenlight-logo.png" alt="Greenlight Logo" width={150} height={150} />
              <div className="text-right">
                <p className="text-sm text-gray-600">Greenlight Water Solutions</p>
                <p className="text-sm text-gray-600">Water Conservation Specialists</p>
                <p className="text-sm text-gray-600">info@greenlight.com</p>
              </div>
            </div>

            <p className="mb-2 text-gray-700">{new Date(formData.reportDate).toLocaleDateString()}</p>
            <p className="mb-6 text-gray-700">{formData.clientName}</p>

            <h1 className="mb-6 text-3xl font-bold text-[#28a745]">
              Water Conservation Installation Report
            </h1>

            <p className="mb-4 leading-relaxed text-gray-800">
              {formData.introduction}
            </p>

            <p className="mb-4 leading-relaxed text-gray-800">
              This report details the water conservation installations completed at your property. 
              Our team has successfully installed water-efficient fixtures that will provide 
              significant water and cost savings over time.
            </p>

            <p className="mb-8 leading-relaxed text-gray-800">
              {formData.conclusion}
            </p>

            <div className="mt-16">
              <p className="mb-2 text-gray-800">Sincerely,</p>
              <p className="mb-4 text-gray-800 font-semibold">{formData.preparedBy}</p>
              <Image src="/images/signature.png" alt="Signature" width={150} height={75} className="mb-4" />
              <p className="text-gray-800">Greenlight Water Solutions</p>
            </div>

            <div className="footer-container">
              <Image
                src="/images/greenlight-footer.png"
                alt="GreenLight Footer"
                width={800}
                height={100}
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>

        {/* Detail Pages */}
        {dataPages.map((pageData, pageIndex) => (
          <div key={pageIndex} className="print-section report-page">
            <div className="p-8">
              <div className="mb-8">
                <Image src="/images/greenlight-logo.png" alt="GreenLight Logo" width={150} height={96} />
              </div>

              <div className="mb-16">
                <h2 className="text-2xl font-bold mb-6 text-[#28a745]">Installation Details - Page {pageIndex + 1}</h2>

                <div className="mb-6 overflow-hidden rounded-lg border border-gray-200 shadow-sm">
                  <table className="w-full">
                    <thead className="bg-[#28a745] text-white">
                      <tr>
                        {displayHeaders.map((header) => (
                          <th key={header} className="px-4 py-3 text-left text-sm font-semibold">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {pageData.map((row, rowIndex) => (
                        <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                          {displayHeaders.map((header) => (
                            <td key={header} className="px-4 py-3 text-sm text-gray-900 border-b border-gray-200">
                              {row[header] || ""}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        <strong>Page Summary:</strong> Showing {pageData.length} units on this page. 
                        Total units in report: {installationData.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="footer-container">
                <Image
                  src="/images/greenlight-footer.png"
                  alt="GreenLight Footer"
                  width={800}
                  height={100}
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        ))}

        {/* Summary Page */}
        <div className="print-section report-page">
          <div className="p-8">
            <div className="mb-8">
              <Image src="/images/greenlight-logo.png" alt="GreenLight Logo" width={150} height={96} />
            </div>

            <div className="mb-16">
              <h2 className="text-2xl font-bold mb-6 text-[#28a745]">Installation Summary</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">Total Units Serviced</h3>
                  <p className="text-3xl font-bold text-green-600">{installationData.length}</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">Project Completion</h3>
                  <p className="text-3xl font-bold text-blue-600">100%</p>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Environmental Impact</h3>
                <p className="text-gray-700 leading-relaxed">
                  The water-efficient fixtures installed in this project will result in significant 
                  water conservation. These improvements contribute to environmental sustainability 
                  while providing long-term cost savings for the property.
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-yellow-800 mb-4">Next Steps</h3>
                <ul className="list-disc list-inside text-yellow-700 space-y-2">
                  <li>Monitor water usage over the next billing cycle</li>
                  <li>Report any issues or concerns to Greenlight Water Solutions</li>
                  <li>Schedule annual maintenance check-ups as recommended</li>
                  <li>Consider additional water conservation measures for future phases</li>
                </ul>
              </div>
            </div>

            <div className="footer-container">
              <Image
                src="/images/greenlight-footer.png"
                alt="GreenLight Footer"
                width={800}
                height={100}
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

// Wrap with ReportProvider
export default function ReportPage() {
  return (
    <ReportProvider>
      <ReportPageContent />
    </ReportProvider>
  )
}

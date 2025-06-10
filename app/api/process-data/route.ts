import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { data, chartType, isCSV } = await request.json()
 // Debug logging for API key
    console.log("API Key Status:", {
      hasKey: !!process.env.XAI_API_KEY,
      keyLength: process.env.XAI_API_KEY?.length,
      environment: process.env.NODE_ENV
    })
    // Check if API key is configured
    if (!process.env.XAI_API_KEY) {
      console.warn("XAI_API_KEY not configured, using fallback processing")
      const fallbackData = fallbackDataProcessing(data, chartType, isCSV)
      return NextResponse.json({ processedData: fallbackData })
    }

    // Prepare the prompt for AI
    const prompt = `You are a data processing expert. I need you to process the following data for a ${chartType} chart.

${isCSV ? "CSV Data:" : "User Description:"}
${data}

Please return a JSON response with the following structure:
{
  "processedData": {
    "chartData": [array of objects with consistent keys],
    "config": {
      "xKey": "string - the key for x-axis data",
      "yKey": "string - the key for y-axis data"
    },
    "title": "string - descriptive title for the chart",
    "description": "string - brief description of the data",
    "insights": "string - key insights from the data"
  }
}

Requirements:
1. For ${chartType} charts, ensure the data format is appropriate
2. Convert all data to proper types (numbers for values, strings for labels)
3. Handle missing or invalid data gracefully
4. Provide meaningful insights about the data patterns
5. Ensure the chartData array has consistent object structure
6. For pie charts, make sure each object has a name and value field
7. For other charts, ensure x and y axis data is properly formatted

Return ONLY the JSON response, no additional text.`

    // Try different models in order of preference
    const models = ["grok-3-mini", "grok-3"]
    let aiResponse = null
    let modelError = null

    // Try each model until one works
    for (const model of models) {
      try {
        console.log(`Trying model: ${model}`)

        const grokResponse = await fetch("https://api.x.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.XAI_API_KEY}`,
          },
          body: JSON.stringify({
            messages: [
              {
                role: "system",
                content:
                  "You are a data processing expert that converts raw data into chart-ready formats. Always respond with valid JSON only.",
              },
              {
                role: "user",
                content: prompt,
              },
            ],
            model: model,
            stream: false,
            temperature: 0.1,
          }),
        })

        if (!grokResponse.ok) {
          const errorText = await grokResponse.text()
          console.error(`xAI API error with model ${model}: ${grokResponse.status} - ${errorText}`)
          modelError = `${grokResponse.status} - ${errorText}`
          continue // Try next model
        }

        const grokResult = await grokResponse.json()
        aiResponse = grokResult.choices[0].message.content
        console.log(`Successfully used model: ${model}`)
        break // We got a successful response, exit the loop
      } catch (error) {
        console.error(`Error with model ${model}:`, error)
        modelError = error.message
        continue // Try next model
      }
    }

    // If no model worked, use fallback
    if (!aiResponse) {
      console.warn(`All models failed, last error: ${modelError}. Using fallback processing.`)
      const fallbackData = fallbackDataProcessing(data, chartType, isCSV)
      return NextResponse.json({ processedData: fallbackData })
    }

    // Parse the AI response
    console.log("Raw AI response:", aiResponse)
    let processedData
    try {
      // Clean the response in case it has markdown formatting
      const cleanedResponse = aiResponse.replace(/```json\n?|\n?```/g, "").trim()
      console.log("Cleaned AI response:", cleanedResponse)

      const parsed = JSON.parse(cleanedResponse)
      console.log("Parsed AI response:", parsed)

      processedData = parsed.processedData || parsed

      // Validate the structure
      if (!processedData.chartData || !Array.isArray(processedData.chartData)) {
        throw new Error("Invalid data structure from AI")
      }

      console.log("Final processed data:", processedData)
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError)
      console.error("AI response was:", aiResponse)
      // Fallback processing
      processedData = fallbackDataProcessing(data, chartType, isCSV)
    }

    return NextResponse.json({ processedData })
  } catch (error) {
    console.error("Error processing data:", error)

    // Fallback processing in case of API failure
    const { data, chartType, isCSV } = await request.json()
    const fallbackData = fallbackDataProcessing(data, chartType, isCSV)
    return NextResponse.json({ processedData: fallbackData })
  }
}

function fallbackDataProcessing(data: string, chartType: string, isCSV: boolean) {
  try {
    if (isCSV) {
      const lines = data.trim().split("\n")
      if (lines.length < 2) {
        throw new Error("Invalid CSV format")
      }

      const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))
      const chartData = lines
        .slice(1)
        .map((line, index) => {
          const values = line.split(",").map((v) => v.trim().replace(/"/g, ""))
          const obj: any = {}
          headers.forEach((header, headerIndex) => {
            const value = values[headerIndex] || ""
            // Try to convert to number, keep as string if not possible
            const numValue = Number.parseFloat(value)
            obj[header] = !isNaN(numValue) && value !== "" ? numValue : value
          })
          return obj
        })
        .filter((obj) => Object.values(obj).some((val) => val !== "")) // Remove empty rows

      // Determine best keys for chart
      const numericKeys = headers.filter((header) => chartData.some((row) => typeof row[header] === "number"))
      const stringKeys = headers.filter((header) => chartData.every((row) => typeof row[header] === "string"))

      const xKey = stringKeys[0] || headers[0]
      const yKey = numericKeys[0] || headers[1] || headers[0]

      return {
        chartData,
        config: {
          xKey,
          yKey,
        },
        title: `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`,
        description: `Visualization of ${headers.join(", ")} data`,
        insights: `Chart shows relationship between ${xKey} and ${yKey}. Data contains ${chartData.length} records.`,
      }
    } else {
      // Text parsing for natural language input
      // For demo purposes, generate sample data based on chart type
      let sampleData

      switch (chartType) {
        case "bar":
          sampleData = [
            { category: "Category A", value: 100 },
            { category: "Category B", value: 200 },
            { category: "Category C", value: 150 },
            { category: "Category D", value: 300 },
          ]
          return {
            chartData: sampleData,
            config: {
              xKey: "category",
              yKey: "value",
            },
            title: "Sample Bar Chart",
            description: "Sample bar chart data",
            insights: "Category D has the highest value, followed by Category B.",
          }

        case "line":
          sampleData = [
            { month: "Jan", value: 100 },
            { month: "Feb", value: 120 },
            { month: "Mar", value: 140 },
            { month: "Apr", value: 160 },
            { month: "May", value: 180 },
            { month: "Jun", value: 200 },
          ]
          return {
            chartData: sampleData,
            config: {
              xKey: "month",
              yKey: "value",
            },
            title: "Sample Line Chart",
            description: "Monthly trend data",
            insights: "Values show a steady increasing trend over the months.",
          }

        case "pie":
          sampleData = [
            { name: "Segment A", value: 30 },
            { name: "Segment B", value: 40 },
            { name: "Segment C", value: 20 },
            { name: "Segment D", value: 10 },
          ]
          return {
            chartData: sampleData,
            config: {
              xKey: "name",
              yKey: "value",
            },
            title: "Sample Pie Chart",
            description: "Distribution by segment",
            insights: "Segment B represents the largest portion at 40%.",
          }

        case "area":
          sampleData = [
            { period: "Week 1", value: 100 },
            { period: "Week 2", value: 150 },
            { period: "Week 3", value: 130 },
            { period: "Week 4", value: 180 },
            { period: "Week 5", value: 220 },
          ]
          return {
            chartData: sampleData,
            config: {
              xKey: "period",
              yKey: "value",
            },
            title: "Sample Area Chart",
            description: "Weekly cumulative data",
            insights: "Values show an overall increasing trend with a slight dip in Week 3.",
          }

        case "scatter":
          sampleData = [
            { x: 10, y: 20 },
            { x: 15, y: 25 },
            { x: 20, y: 30 },
            { x: 25, y: 35 },
            { x: 30, y: 40 },
            { x: 35, y: 45 },
            { x: 40, y: 50 },
          ]
          return {
            chartData: sampleData,
            config: {
              xKey: "x",
              yKey: "y",
            },
            title: "Sample Scatter Plot",
            description: "Correlation between X and Y",
            insights: "There appears to be a positive correlation between X and Y variables.",
          }

        case "trend":
          sampleData = [
            { quarter: "Q1 2023", value: 100 },
            { quarter: "Q2 2023", value: 120 },
            { quarter: "Q3 2023", value: 140 },
            { quarter: "Q4 2023", value: 160 },
            { quarter: "Q1 2024", value: 180 },
            { quarter: "Q2 2024", value: 200 },
          ]
          return {
            chartData: sampleData,
            config: {
              xKey: "quarter",
              yKey: "value",
            },
            title: "Sample Trend Chart",
            description: "Quarterly trend analysis",
            insights: "Values show a consistent upward trend across all quarters.",
          }

        default:
          sampleData = [
            { label: "Item 1", value: 100 },
            { label: "Item 2", value: 200 },
            { label: "Item 3", value: 150 },
            { label: "Item 4", value: 300 },
          ]
          return {
            chartData: sampleData,
            config: {
              xKey: "label",
              yKey: "value",
            },
            title: "Sample Data Visualization",
            description: "Sample data for visualization",
            insights: "Item 4 has the highest value, followed by Item 2.",
          }
      }
    }
  } catch (error) {
    console.error("Fallback processing error:", error)
    // Ultimate fallback
    return {
      chartData: [
        { name: "Data 1", value: 100 },
        { name: "Data 2", value: 200 },
        { name: "Data 3", value: 150 },
      ],
      config: {
        xKey: "name",
        yKey: "value",
      },
      title: "Default Chart",
      description: "Default sample data",
      insights: "Unable to process the provided data. Please check the format and try again.",
    }
  }
}

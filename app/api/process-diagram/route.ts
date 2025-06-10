import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { description, diagramType } = await request.json()

    // Check if API key is configured
    if (!process.env.XAI_API_KEY) {
      console.warn("XAI_API_KEY not configured, using fallback processing")
      const fallbackData = fallbackDiagramProcessing(description, diagramType)
      return NextResponse.json({ processedData: fallbackData })
    }

    // Prepare the prompt for AI
    const prompt = `You are a Mermaid diagram expert. I need you to create a ${diagramType} diagram based on this description:

Description: ${description}

Please return a JSON response with the following structure:
{
  "processedData": {
    "mermaidCode": "string - valid Mermaid syntax for the diagram",
    "title": "string - descriptive title for the diagram", 
    "description": "string - brief description of what the diagram shows",
    "diagramType": "${diagramType}"
  }
}

Requirements for ${diagramType} diagrams:
${
  diagramType === "sequence"
    ? `
- Use "sequenceDiagram" as the first line
- Define participants with "participant Name as DisplayName"
- Use arrows: ->> for sync calls, -->> for responses, -x for async
- Use proper syntax: "ParticipantA->>ParticipantB: Message"
- No numbers or special characters in participant names
- Keep messages clear and concise
`
    : `
- Generate valid Mermaid syntax for a ${diagramType}
- Make sure the syntax is correct and will render properly
- Include appropriate labels and connections
- Keep the diagram clear and well-organized
- Use proper Mermaid syntax for ${diagramType} diagrams
`
}

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
                  "You are a Mermaid diagram expert that creates valid diagram syntax. Always respond with valid JSON only.",
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
      const fallbackData = fallbackDiagramProcessing(description, diagramType)
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
      if (!processedData.mermaidCode) {
        throw new Error("Invalid diagram structure from AI")
      }

      console.log("Final processed data:", processedData)
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError)
      console.error("AI response was:", aiResponse)
      // Fallback processing
      processedData = fallbackDiagramProcessing(description, diagramType)
    }

    return NextResponse.json({ processedData })
  } catch (error) {
    console.error("Error processing diagram:", error)

    // Fallback processing in case of API failure
    const { description, diagramType } = await request.json()
    const fallbackData = fallbackDiagramProcessing(description, diagramType)
    return NextResponse.json({ processedData: fallbackData })
  }
}

function fallbackDiagramProcessing(description: string, diagramType: string) {
  // Generate basic diagrams based on type
  const templates = {
    flowchart: `graph TD
    A[Start] --> B{Decision Point}
    B -->|Yes| C[Process A]
    B -->|No| D[Process B]
    C --> E[End]
    D --> E`,

    mindmap: `mindmap
  root((${description.split(" ").slice(0, 2).join(" ") || "Main Topic"}))
    Branch 1
      Sub-topic A
      Sub-topic B
    Branch 2
      Sub-topic C
      Sub-topic D`,

    orgchart: `graph TD
    CEO[CEO/Manager] --> A[Team Lead A]
    CEO --> B[Team Lead B]
    A --> A1[Member 1]
    A --> A2[Member 2]
    B --> B1[Member 3]
    B --> B2[Member 4]`,

    sequence: `sequenceDiagram
    participant User as User
    participant System as System
    participant Database as Database
    
    User->>System: Login Request
    System->>Database: Validate Credentials
    Database-->>System: User Data
    System-->>User: Authentication Success
    
    User->>System: Data Request
    System->>Database: Query Data
    Database-->>System: Return Results
    System-->>User: Display Data`,

    network: `graph LR
    A[Server] --> B[Router]
    B --> C[Switch]
    C --> D[Device 1]
    C --> E[Device 2]
    C --> F[Device 3]`,

    gantt: `gantt
    title Project Timeline
    dateFormat YYYY-MM-DD
    section Phase 1
    Task 1: 2024-01-01, 30d
    Task 2: after task1, 20d
    section Phase 2
    Task 3: 2024-02-15, 25d`,

    gitgraph: `gitGraph
    commit
    branch develop
    checkout develop
    commit
    commit
    checkout main
    merge develop
    commit`,

    journey: `journey
    title User Journey
    section Discovery
      Visit Site: 5: User
      Browse: 4: User
    section Action
      Sign Up: 3: User
      Complete: 5: User`,
  }

  const mermaidCode = templates[diagramType as keyof typeof templates] || templates.flowchart

  return {
    mermaidCode,
    title: `${diagramType.charAt(0).toUpperCase() + diagramType.slice(1)} Diagram`,
    description: `Generated ${diagramType} diagram based on: ${description}`,
    diagramType,
  }
}

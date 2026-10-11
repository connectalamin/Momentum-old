import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import axios from 'axios';

const prisma = new PrismaClient();

// Generate mind map with AI
export const generateMindMap = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { topic, description, type = 'general', context } = req.body;

    if (!topic || topic.trim() === '') {
      return res.status(400).json({ error: 'Topic is required' });
    }

    // Build AI prompt - comprehensive learning roadmap generator
    const prompt = `You are an expert learning path designer. Create a detailed, comprehensive mind map roadmap for learning "${topic}".

${description ? `User's Goal: ${description}` : ''}
${context ? `Additional Context: ${context}` : ''}
Type: ${type}

IMPORTANT: Generate a COMPLETE learning roadmap with AT LEAST 15-25 nodes organized hierarchically.

Return a valid JSON object with this structure:
{
  "title": "${topic} Learning Roadmap",
  "description": "Complete learning path for ${topic}",
  "nodes": [...],
  "edges": [...]
}

NODE POSITIONING RULES (CRITICAL - PREVENT OVERLAPPING):
- Canvas size: 1400x900 pixels
- Minimum spacing: 200px horizontal, 150px vertical between nodes
- Center node at: x:700, y:450
- Use grid-like positioning in layers

REQUIRED NODE STRUCTURE (create ALL of these):

1. CENTER NODE (id: "center"):
   {"id": "center", "type": "skill", "position": {"x": 700, "y": 450}, "data": {"label": "${topic}", "category": "Main Topic", "level": "beginner", "progress": 0}}

2. PHASE NODES (4-6 nodes) - Positioned in a circle around center:
   - "phase-1": Fundamentals (position: {x: 200, y: 150})
   - "phase-2": Core Concepts (position: {x: 1200, y: 150})
   - "phase-3": Intermediate (position: {x: 200, y: 750})
   - "phase-4": Advanced (position: {x: 1200, y: 750})
   - "phase-5": Projects (position: {x: 700, y: 850})
   Use type: "skill" with data: {label, category, level, progress: 0}

3. TOPIC NODES (10-15 nodes) - Spread under each phase:
   - Phase 1 topics: x: 50-350, y: 50-300 (spaced 180px apart)
   - Phase 2 topics: x: 1050-1350, y: 50-300
   - Phase 3 topics: x: 50-350, y: 600-850
   - Phase 4 topics: x: 1050-1350, y: 600-850
   Use type: "topic" with data: {label, description: "what to learn"}

4. MILESTONE NODES (3-5 nodes) - Middle column:
   Position at x: 500-900, y: 200, 350, 550, 700 (spaced vertically)
   Use type: "milestone" with data: {label, status: "pending", estimatedHours: number}

5. COURSE NODES (2-3 nodes) - Near their related phases:
   Use type: "course" with data: {label, courseCode: "101", credits: 3, progress: 0}

EDGES: Connect ALL nodes. Format:
{"id": "e-[source]-[target]", "source": "[source-id]", "target": "[target-id]", "type": "smoothstep", "animated": false}

- Connect center to all phase nodes
- Connect each phase to its topic nodes
- Connect milestones to relevant phases
- Every node MUST have at least one connection

EXAMPLE POSITIONS for 20 nodes:
- Center: (700, 450)
- Phase 1-5: (200,150), (1200,150), (200,750), (1200,750), (700,850)
- Topics row 1: (100,50), (300,50), (1100,50), (1300,50)
- Topics row 2: (100,200), (300,200), (1100,200), (1300,200)
- Topics row 3: (100,600), (300,600), (1100,600), (1300,600)
- Milestones: (550,250), (850,250), (550,650), (850,650)

NOW generate complete JSON for "${topic}". Include 15-25 nodes with WELL-SPACED positions (minimum 180px apart).

CRITICAL: Return ONLY pure JSON. No markdown, no \`\`\`, no explanation.`;

    // Call Python AI service using axios (consistent with other controllers)
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8001';
    const response = await axios.post(`${aiServiceUrl}/chat`, {
      message: prompt,
      user_id: userId,
      context_type: 'mindmap_generation',
    }, {
      timeout: 120000, // 2 minutes timeout for complex generation
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const aiResponse: any = response.data;
    let mindMapData;

    try {
      // Extract JSON from AI response
      const jsonMatch = aiResponse.response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        mindMapData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON found in AI response');
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      // Fallback: create a basic mind map structure
      mindMapData = {
        title: topic,
        description: description || `Mind map for ${topic}`,
        nodes: [
          {
            id: 'central-1',
            type: 'topic',
            position: { x: 400, y: 300 },
            data: {
              label: topic,
              description: description || `Central concept: ${topic}`,
            },
          },
        ],
        edges: [],
      };
    }

    res.json(mindMapData);
  } catch (error) {
    console.error('Error generating mind map:', error);
    res.status(500).json({ 
      error: 'Failed to generate mind map',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Generate mind map from skill
export const generateMindMapFromSkill = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { skillId } = req.params;

    // Get skill with milestones and resources
    const skill = await prisma.skill.findUnique({
      where: { id: skillId, userId },
      include: {
        milestones: true,
        learningResources: true,
      },
    });

    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    // Build prompt
    const prompt = `Generate a mind map for the following skill development plan:

Skill: ${skill.name}
Category: ${skill.category || 'General'}
Level: ${skill.level || 'Beginner'}
Description: ${skill.description || 'No description'}
Goal: ${skill.goalStatement || 'No specific goal'}
Duration: ${skill.durationMonths || 0} months

Milestones (${skill.milestones.length}):
${skill.milestones.map((m: any, i: number) => `${i + 1}. ${m.name} (${m.estimatedHours || 0}h, Status: ${m.status})`).join('\n')}

Learning Resources (${skill.learningResources.length}):
${skill.learningResources.map((r: any, i: number) => `${i + 1}. ${r.title} (${r.type})`).join('\n')}

Create a visual mind map showing:
1. Central node: The skill name
2. Major branches: Key learning areas or phases
3. Milestone nodes: Each milestone as a node with connections
4. Resource nodes: Important learning resources
5. Subtopics: Key concepts and skills to master

Use the same JSON format as before with nodes and edges. Make it comprehensive and visually organized.`;

    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8001';
    const response = await axios.post(`${aiServiceUrl}/chat`, {
      message: prompt,
      user_id: userId,
      context_type: 'skill_mindmap',
    }, {
      timeout: 60000, // 60 seconds timeout
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const aiResponse: any = response.data;
    let mindMapData;

    try {
      const jsonMatch = aiResponse.response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        mindMapData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON found in AI response');
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      // Create basic structure from skill data
      const nodes = [
        {
          id: 'skill-central',
          type: 'skill',
          position: { x: 400, y: 300 },
          data: {
            label: skill.name,
            category: skill.category,
            level: skill.level,
            progress: 0,
          },
        },
        ...skill.milestones.map((m: any, i: number) => ({
          id: `milestone-${m.id}`,
          type: 'milestone',
          position: { x: 200 + (i * 150), y: 150 },
          data: {
            label: m.name,
            status: m.status,
            estimatedHours: m.estimatedHours,
          },
        })),
      ];

      const edges = skill.milestones.map((m: any) => ({
        id: `edge-skill-${m.id}`,
        source: 'skill-central',
        target: `milestone-${m.id}`,
        type: 'smoothstep',
        animated: true,
      }));

      mindMapData = {
        title: `${skill.name} Learning Path`,
        description: skill.description || `Mind map for ${skill.name}`,
        nodes,
        edges,
      };
    }

    res.json(mindMapData);
  } catch (error) {
    console.error('Error generating mind map from skill:', error);
    res.status(500).json({ 
      error: 'Failed to generate mind map from skill',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

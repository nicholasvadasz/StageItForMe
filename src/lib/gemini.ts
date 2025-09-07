import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export interface StagingOptions {
  roomType: 'living-room' | 'bedroom' | 'kitchen' | 'dining-room' | 'bathroom' | 'office';
  furnitureStyle: 'modern' | 'traditional' | 'minimalist' | 'rustic' | 'industrial' | 'scandinavian';
  budget?: 'budget' | 'mid-range' | 'luxury';
}

export interface StagingResult {
  success: boolean;
  imageBuffer?: Buffer;
  error?: string;
  prompt?: string;
}

export interface CollageResult {
  success: boolean;
  imageBuffer?: Buffer;
  error?: string;
  prompt?: string;
}

export class VirtualStagingService {
  private model = ai.models.generateContent;

  async stageRoom(
    imageBuffer: Buffer,
    mimeType: string,
    options: StagingOptions
  ): Promise<StagingResult> {
    try {
      const base64Image = imageBuffer.toString('base64');
      const prompt = this.generateStagingPrompt(options);

      const response = await this.model({
        model: "gemini-2.5-flash-image-preview",
        contents: [
          {
            text: prompt
          },
          {
            inlineData: {
              mimeType,
              data: base64Image,
            },
          },
        ],
      });

      // Extract the generated image from response
      if (!response.candidates || response.candidates.length === 0) {
        return {
          success: false,
          error: 'No candidates in response',
          prompt,
        };
      }

      const candidate = response.candidates[0];
      if (!candidate.content || !candidate.content.parts) {
        return {
          success: false,
          error: 'No content in response',
          prompt,
        };
      }

      for (const part of candidate.content.parts) {
        if (part.inlineData?.data) {
          const imageData = part.inlineData.data;
          const buffer = Buffer.from(imageData, 'base64');
          return {
            success: true,
            imageBuffer: buffer,
            prompt,
          };
        }
      }

      return {
        success: false,
        error: 'No image generated in response',
        prompt,
      };

    } catch (error) {
      console.error('Gemini staging error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async identifyFurnitureLocations(
    collageImageBuffer: Buffer,
    furnitureNames: string[],
    mimeType: string
  ): Promise<{ success: boolean; locations?: Record<string, string>; error?: string }> {
    try {
      const base64Collage = collageImageBuffer.toString('base64');

      const furnitureList = furnitureNames.join(', ');
      const prompt = `Identify where each piece of furniture is located in this room. The furniture pieces are: ${furnitureList}. 

Format your response exactly like this JSON object:
{
  "Eames Lounge Chair": "back left corner",
  "Tiffany Floor Lamp": "back left corner, behind chair",
  "Glass Coffee Table": "center of room, in front of seating area"
}

Be specific about the location descriptions using terms like: front/back, left/right, corner, center, near window, by wall, etc.`;

      const response = await this.model({
        model: "gemini-2.5-flash",
        contents: [
          {
            inlineData: {
              mimeType,
              data: base64Collage,
            },
          },
          { text: prompt },
        ],
      });

      if (!response.candidates || response.candidates.length === 0) {
        return {
          success: false,
          error: 'No candidates in response',
        };
      }

      const candidate = response.candidates[0];
      if (!candidate.content || !candidate.content.parts) {
        return {
          success: false,
          error: 'No content in response',
        };
      }

      // Extract text response and parse JSON
      let responseText = '';
      for (const part of candidate.content.parts) {
        if (part.text) {
          responseText += part.text;
        }
      }

      try {
        // Try to extract JSON from the response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const locations = JSON.parse(jsonMatch[0]);
          return {
            success: true,
            locations,
          };
        } else {
          return {
            success: false,
            error: 'Could not parse furniture locations from response',
          };
        }
      } catch (parseError) {
        return {
          success: false,
          error: 'Failed to parse JSON response',
        };
      }

    } catch (error) {
      console.error('Gemini furniture identification error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async stageRoomWithLocations(
    contactSheetBuffer: Buffer,
    originalImageBuffer: Buffer,
    furnitureLocations: Record<string, string>,
    mimeType: string
  ): Promise<CollageResult> {
    try {
      const base64ContactSheet = contactSheetBuffer.toString('base64');
      const base64Original = originalImageBuffer.toString('base64');

      // Build placement instructions using room descriptors with camera perspective context
      const placementInstructions = Object.entries(furnitureLocations)
        .map(([furniture, location]) => `Place the ${furniture} in the ${location}`)
        .join('. ');

      const prompt = `Using the furniture catalog (first image) and the original room (second image), stage the room by placing furniture as instructed. ${placementInstructions}. Interpret room locations from the camera's perspective.`;

      const response = await this.model({
        model: "gemini-2.5-flash-image-preview",
        contents: [
          {
            inlineData: {
              mimeType,
              data: base64ContactSheet,
            },
          },
          {
            inlineData: {
              mimeType,
              data: base64Original,
            },
          },
          { text: prompt },
        ],
      });

      // Extract the generated image from response
      if (!response.candidates || response.candidates.length === 0) {
        return {
          success: false,
          error: 'No candidates in response',
          prompt,
        };
      }

      const candidate = response.candidates[0];
      if (!candidate.content || !candidate.content.parts) {
        return {
          success: false,
          error: 'No content in response',
          prompt,
        };
      }

      for (const part of candidate.content.parts) {
        if (part.inlineData?.data) {
          const imageData = part.inlineData.data;
          const buffer = Buffer.from(imageData, 'base64');
          return {
            success: true,
            imageBuffer: buffer,
            prompt,
          };
        }
      }

      return {
        success: false,
        error: 'No image generated in response',
        prompt,
      };

    } catch (error) {
      console.error('Gemini location-based staging error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async refineStaging(
    originalImageBuffer: Buffer,
    stagedImageBuffer: Buffer,
    mimeType: string,
    refinementInstructions: string
  ): Promise<StagingResult> {
    try {
      const base64Original = originalImageBuffer.toString('base64');
      const base64Staged = stagedImageBuffer.toString('base64');

      const prompt = `Using the provided staged room image, ${refinementInstructions}. Keep all existing architectural features and maintain the professional staging aesthetic.`;

      const response = await this.model({
        model: "gemini-2.5-flash-image-preview",
        contents: [
          { text: prompt },
          {
            inlineData: {
              mimeType,
              data: base64Staged,
            },
          },
        ],
      });

      // Extract the refined image from response
      if (!response.candidates || response.candidates.length === 0) {
        return {
          success: false,
          error: 'No candidates in response',
          prompt,
        };
      }

      const candidate = response.candidates[0];
      if (!candidate.content || !candidate.content.parts) {
        return {
          success: false,
          error: 'No content in response',
          prompt,
        };
      }

      for (const part of candidate.content.parts) {
        if (part.inlineData?.data) {
          const imageData = part.inlineData.data;
          const buffer = Buffer.from(imageData, 'base64');
          return {
            success: true,
            imageBuffer: buffer,
            prompt,
          };
        }
      }

      return {
        success: false,
        error: 'No refined image generated',
        prompt,
      };

    } catch (error) {
      console.error('Gemini refinement error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  private generateStagingPrompt(options: StagingOptions): string {
    const { roomType, furnitureStyle, budget } = options;

    // Simple, direct prompt
    let styleDescription: string = furnitureStyle;
    if (budget && budget !== 'mid-range') {
      const budgetPrefix = budget === 'luxury' ? 'high-end' : 'affordable';
      styleDescription = `${budgetPrefix} ${furnitureStyle}`;
    }

    const prompt = `Add some ${styleDescription} furniture to this ${roomType.replace('-', ' ')}. You should not add any new non-decorative elements, like outlets or light switches.`;

    return prompt;
  }

  async generateVariations(
    imageBuffer: Buffer,
    mimeType: string,
    baseOptions: StagingOptions,
    variations: Partial<StagingOptions>[]
  ): Promise<StagingResult[]> {
    const results: StagingResult[] = [];

    for (const variation of variations) {
      const combinedOptions = { ...baseOptions, ...variation };
      const result = await this.stageRoom(imageBuffer, mimeType, combinedOptions);
      results.push(result);
    }

    return results;
  }
}

export const virtualStagingService = new VirtualStagingService();
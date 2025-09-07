import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export interface StagingOptions {
  roomType: 'living-room' | 'bedroom' | 'kitchen' | 'dining-room' | 'bathroom' | 'office';
  furnitureStyle: 'modern' | 'traditional' | 'minimalist' | 'rustic' | 'industrial' | 'scandinavian';
  lighting: 'bright' | 'warm' | 'natural' | 'dramatic';
  colorScheme?: 'neutral' | 'warm' | 'cool' | 'bold';
  budget?: 'budget' | 'mid-range' | 'luxury';
}

export interface StagingResult {
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
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
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

  async refineStaging(
    originalImageBuffer: Buffer,
    stagedImageBuffer: Buffer,
    mimeType: string,
    refinementInstructions: string
  ): Promise<StagingResult> {
    try {
      const base64Original = originalImageBuffer.toString('base64');
      const base64Staged = stagedImageBuffer.toString('base64');

      const prompt = `Using the provided staged room image, please make the following refinements: ${refinementInstructions}. 
      Maintain the overall staging concept but adjust according to the specific instructions. 
      Ensure the final result looks professional and realistic for real estate marketing.`;

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

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
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
    const { roomType, furnitureStyle, lighting, colorScheme, budget } = options;

    const roomDescriptions = {
      'living-room': 'living room with seating area, coffee table, and entertainment setup',
      'bedroom': 'bedroom with bed, nightstands, and storage furniture',
      'kitchen': 'kitchen with modern appliances, countertops, and dining elements',
      'dining-room': 'dining room with dining table, chairs, and decorative elements',
      'bathroom': 'bathroom with updated fixtures, storage, and spa-like elements',
      'office': 'home office with desk, chair, storage, and professional setup'
    };

    const styleDescriptions = {
      'modern': 'sleek, contemporary furniture with clean lines, neutral colors, and minimalist aesthetic',
      'traditional': 'classic, elegant furniture with rich fabrics, warm colors, and timeless appeal',
      'minimalist': 'simple, uncluttered furniture with neutral tones and clean geometric shapes',
      'rustic': 'natural wood furniture with warm textures, earth tones, and cozy farmhouse appeal',
      'industrial': 'metal and wood furniture with urban loft aesthetic, darker tones, and raw materials',
      'scandinavian': 'light wood furniture with white and light colors, cozy textiles, and hygge elements'
    };

    const lightingDescriptions = {
      'bright': 'well-lit with abundant natural light, bright artificial lighting, and airy atmosphere',
      'warm': 'cozy warm lighting with golden tones, table lamps, and intimate ambiance',
      'natural': 'natural daylight streaming through windows with soft, even illumination',
      'dramatic': 'dramatic lighting with interesting shadows, accent lighting, and mood-setting elements'
    };

    let prompt = `Transform this empty or sparsely furnished room into a beautifully staged ${roomDescriptions[roomType]}. 

    Style Requirements:
    - Use ${styleDescriptions[furnitureStyle]}
    - Lighting should be ${lightingDescriptions[lighting]}`;

    if (colorScheme) {
      const colorDescriptions = {
        'neutral': 'neutral color palette with whites, grays, and beiges',
        'warm': 'warm color palette with earth tones, browns, and golden accents',
        'cool': 'cool color palette with blues, greens, and silver accents',
        'bold': 'bold color palette with vibrant accent colors and dramatic contrasts'
      };
      prompt += `\n    - Color scheme: ${colorDescriptions[colorScheme]}`;
    }

    if (budget) {
      const budgetDescriptions = {
        'budget': 'affordable, practical furniture that looks stylish but cost-effective',
        'mid-range': 'quality furniture with good materials and craftsmanship at moderate price points',
        'luxury': 'high-end, designer furniture with premium materials and exceptional quality'
      };
      prompt += `\n    - Furniture tier: ${budgetDescriptions[budget]}`;
    }

    prompt += `

    Technical Requirements:
    - Maintain the original room's architecture and proportions exactly
    - Ensure all furniture is properly scaled and positioned realistically
    - Match lighting conditions to the original photo
    - Create a cohesive, professional look suitable for real estate marketing
    - Add appropriate decorative elements like artwork, plants, and accessories
    - Ensure the staging enhances the room's best features and potential
    
    The result should be photorealistic and indistinguishable from professionally staged photography used in high-end real estate listings.`;

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
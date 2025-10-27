/**
 * Meshy API Client
 * Interfaces with Meshy.ai for 3D model generation, texturing, and animation
 * Docs: https://docs.meshy.ai
 */

export interface MeshyConfig {
  apiKey: string;
  baseUrl?: string;
}

export interface TextTo3DRequest {
  mode: 'preview' | 'refine';
  prompt: string;
  art_style: 'realistic' | 'cartoon' | 'low-poly' | 'sculpture' | 'pbr';
  negative_prompt?: string;
  ai_model?: 'meshy-4' | 'meshy-3' | 'meshy-2';
  topology?: 'quad' | 'triangle';
  target_polycount?: number;
  should_remesh?: boolean;
}

export interface ImageTo3DRequest {
  mode: 'preview' | 'refine';
  image_url: string;
  enable_pbr?: boolean;
  ai_model?: 'meshy-4';
  topology?: 'quad' | 'triangle';
  target_polycount?: number;
}

export interface MultiImageTo3DRequest {
  mode: 'preview' | 'refine';
  image_urls: string[];
  enable_pbr?: boolean;
  ai_model?: 'meshy-4';
}

export interface RemeshRequest {
  model_url: string;
  target_polycount: number;
  topology?: 'quad' | 'triangle';
}

export interface RetextureRequest {
  model_url: string;
  prompt: string;
  art_style?: 'realistic' | 'cartoon' | 'low-poly';
  negative_prompt?: string;
  ai_model?: 'meshy-4';
  enable_pbr?: boolean;
  resolution?: '1024' | '2048' | '4096';
}

export interface RiggingRequest {
  model_url: string;
  auto_weight_paint?: boolean;
}

export interface AnimationRequest {
  rigged_model_url: string;
  animation_id: string; // From animation library
  fps?: number;
  loop?: boolean;
}

export interface TaskResponse {
  id: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'SUCCEEDED' | 'FAILED' | 'EXPIRED';
  progress: number;
  model_urls?: {
    glb?: string;
    fbx?: string;
    usd?: string;
    obj?: string;
  };
  texture_urls?: {
    base_color?: string;
    metallic?: string;
    roughness?: string;
    normal?: string;
  };
  thumbnail_url?: string;
  video_url?: string;
  error?: string;
  created_at: number;
  finished_at?: number;
}

export interface AnimationLibraryEntry {
  id: string;
  name: string;
  category: string;
  duration: number;
  thumbnail_url: string;
  tags: string[];
}

export class MeshyClient {
  private config: MeshyConfig;
  private baseUrl: string;

  constructor(config: MeshyConfig) {
    this.config = config;
    this.baseUrl = config.baseUrl || 'https://api.meshy.ai';
  }

  /**
   * Create text-to-3D task
   */
  async createTextTo3D(request: TextTo3DRequest): Promise<TaskResponse> {
    return this.makeRequest('/v2/text-to-3d', 'POST', request);
  }

  /**
   * Create image-to-3D task
   */
  async createImageTo3D(request: ImageTo3DRequest): Promise<TaskResponse> {
    return this.makeRequest('/v2/image-to-3d', 'POST', request);
  }

  /**
   * Create multi-image-to-3D task
   */
  async createMultiImageTo3D(request: MultiImageTo3DRequest): Promise<TaskResponse> {
    return this.makeRequest('/v2/image-to-3d', 'POST', request);
  }

  /**
   * Create remesh task
   */
  async createRemesh(request: RemeshRequest): Promise<TaskResponse> {
    return this.makeRequest('/v1/remesh', 'POST', request);
  }

  /**
   * Create retexture task
   */
  async createRetexture(request: RetextureRequest): Promise<TaskResponse> {
    return this.makeRequest('/v2/retexture', 'POST', request);
  }

  /**
   * Create rigging task
   */
  async createRigging(request: RiggingRequest): Promise<TaskResponse> {
    return this.makeRequest('/v1/rigging', 'POST', request);
  }

  /**
   * Create animation task
   */
  async createAnimation(request: AnimationRequest): Promise<TaskResponse> {
    return this.makeRequest('/v1/animation', 'POST', request);
  }

  /**
   * Get task status
   */
  async getTask(taskId: string): Promise<TaskResponse> {
    return this.makeRequest(`/v2/tasks/${taskId}`, 'GET');
  }

  /**
   * Get animation library
   */
  async getAnimationLibrary(): Promise<AnimationLibraryEntry[]> {
    const response = await this.makeRequest('/v1/animation-library', 'GET');
    return response.animations || [];
  }

  /**
   * Poll task until completion
   */
  async waitForTask(taskId: string, options: {
    pollInterval?: number;
    maxWaitTime?: number;
    onProgress?: (progress: number) => void;
  } = {}): Promise<TaskResponse> {
    const {
      pollInterval = 5000,
      maxWaitTime = 600000, // 10 minutes
      onProgress
    } = options;

    const startTime = Date.now();

    while (true) {
      const task = await this.getTask(taskId);

      if (onProgress) {
        onProgress(task.progress);
      }

      if (task.status === 'SUCCEEDED') {
        return task;
      }

      if (task.status === 'FAILED' || task.status === 'EXPIRED') {
        throw new Error(`Task failed: ${task.error || task.status}`);
      }

      if (Date.now() - startTime > maxWaitTime) {
        throw new Error('Task timeout');
      }

      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
  }

  /**
   * Make API request
   */
  private async makeRequest(
    endpoint: string,
    method: 'GET' | 'POST' | 'DELETE',
    body?: any
  ): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;

    const options: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      }
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Meshy API error: ${response.status} - ${error.message || response.statusText}`);
    }

    return response.json();
  }

  /**
   * Helper: Generate complete 3D asset (text -> 3D -> retexture -> rig -> animate)
   */
  async generateCompleteAsset(options: {
    prompt: string;
    artStyle: TextTo3DRequest['art_style'];
    animations?: string[];
    retexturePrompt?: string;
    onProgress?: (stage: string, progress: number) => void;
  }): Promise<{
    modelUrls: TaskResponse['model_urls'];
    textureUrls: TaskResponse['texture_urls'];
    animatedModelUrl?: string;
  }> {
    const { prompt, artStyle, animations = [], retexturePrompt, onProgress } = options;

    // Step 1: Generate base model
    onProgress?.('text-to-3d', 0);
    const textTo3DTask = await this.createTextTo3D({
      mode: 'refine',
      prompt,
      art_style: artStyle,
      ai_model: 'meshy-4'
    });

    const completedModel = await this.waitForTask(textTo3DTask.id, {
      onProgress: (progress) => onProgress?.('text-to-3d', progress)
    });

    let textureUrls = completedModel.texture_urls;

    // Step 2: Retexture if requested
    if (retexturePrompt && completedModel.model_urls?.glb) {
      onProgress?.('retexture', 0);
      const retextureTask = await this.createRetexture({
        model_url: completedModel.model_urls.glb,
        prompt: retexturePrompt,
        art_style: (artStyle === 'sculpture' || artStyle === 'pbr') ? 'realistic' : artStyle,
        ai_model: 'meshy-4',
        enable_pbr: true,
        resolution: '2048'
      });

      const retextured = await this.waitForTask(retextureTask.id, {
        onProgress: (progress) => onProgress?.('retexture', progress)
      });

      textureUrls = retextured.texture_urls;
    }

    // Step 3: Rig and animate if requested
    let animatedModelUrl: string | undefined;

    if (animations.length > 0 && completedModel.model_urls?.glb) {
      onProgress?.('rigging', 0);
      const riggingTask = await this.createRigging({
        model_url: completedModel.model_urls.glb,
        auto_weight_paint: true
      });

      const rigged = await this.waitForTask(riggingTask.id, {
        onProgress: (progress) => onProgress?.('rigging', progress)
      });

      if (rigged.model_urls?.glb) {
        // Apply first animation
        onProgress?.('animation', 0);
        const animationTask = await this.createAnimation({
          rigged_model_url: rigged.model_urls.glb,
          animation_id: animations[0],
          fps: 30,
          loop: true
        });

        const animated = await this.waitForTask(animationTask.id, {
          onProgress: (progress) => onProgress?.('animation', progress)
        });

        animatedModelUrl = animated.model_urls?.glb;
      }
    }

    return {
      modelUrls: completedModel.model_urls,
      textureUrls,
      animatedModelUrl
    };
  }
}

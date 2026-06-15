export type PickedMedia = {
  uri: string
  type: 'image' | 'video'
  base64?: string | null
  mimeType?: string | null
  width?: number
  height?: number
  duration?: number | null
  fileSize?: number | null
  fileName?: string | null
}

export interface CameraGateway {
  pickImageFromLibrary(): Promise<PickedMedia | null>
  takePhoto(): Promise<PickedMedia | null>
}

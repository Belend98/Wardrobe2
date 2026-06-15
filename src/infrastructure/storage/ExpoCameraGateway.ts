import type {
  CameraGateway,
  PickedMedia,
} from '@/src/domain/gateways/CameraGateway'
import * as ImagePicker from 'expo-image-picker'
import { Platform } from 'react-native'

function mapAsset(asset: ImagePicker.ImagePickerAsset): PickedMedia {
  return {
    uri: asset.uri,
    type: asset.type === 'video' ? 'video' : 'image',
    base64: asset.base64,
    mimeType: asset.mimeType,
    width: asset.width,
    height: asset.height,
    duration: asset.duration,
    fileSize: asset.fileSize,
    fileName: asset.fileName,
  }
}

export class ExpoCameraGateway implements CameraGateway {
  async pickImageFromLibrary(): Promise<PickedMedia | null> {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      throw new Error("Permission galerie refusée. Autorisez l'accès aux photos/videos.")
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
      base64: false,
    })

    if (result.canceled || !result.assets?.length) return null

    return mapAsset(result.assets[0])
  }

  async takePhoto(): Promise<PickedMedia | null> {
    const permission = await ImagePicker.requestCameraPermissionsAsync()
    if (!permission.granted) {
      throw new Error('Permission camera refusée.')
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: Platform.OS === 'ios',
      quality: 0.6,
      base64: false,
    })

    if (result.canceled || !result.assets?.length) return null

    return mapAsset(result.assets[0])
  }
}

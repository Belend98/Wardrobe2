import * as ImagePicker from 'expo-image-picker'
import type { PickedMedia } from './camera.types'

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

export async function requestMediaLibraryPermissionOrThrow() {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
  if (!permission.granted) {
    throw new Error("Permission galerie refusee. Autorise l'acces aux photos/videos.")
  }
}

export async function requestCameraPermissionOrThrow() {
  const permission = await ImagePicker.requestCameraPermissionsAsync()
  if (!permission.granted) {
    throw new Error('Permission camera refusee.')
  }
}

export async function pickImageFromLibrary() {
  await requestMediaLibraryPermissionOrThrow()

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    quality: 0.8,
    base64: true,
  })

  if (result.canceled || !result.assets?.length) {
    return null
  }

  return mapAsset(result.assets[0])
}


export async function takePhotoWithCamera() {
  await requestCameraPermissionOrThrow()

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    quality: 0.8,
    base64: true,
  })

  if (result.canceled || !result.assets?.length) {
    return null
  }

  return mapAsset(result.assets[0])
}

import * as ImagePicker from 'expo-image-picker'
import { Platform } from 'react-native'
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
    throw new Error("Permission galerie refusée. Autorisez l'accès aux photos/videos.")
  }
}

export async function requestCameraPermissionOrThrow() {
  const permission = await ImagePicker.requestCameraPermissionsAsync()
  if (!permission.granted) {
    throw new Error('Permission camera refusée.')
  }
}

export async function pickImageFromLibrary() {
  await requestMediaLibraryPermissionOrThrow()

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    quality: 0.8,
    base64: false,
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
    allowsEditing: Platform.OS === 'ios',
    quality: 0.6,
    base64: false,
  })

  if (result.canceled || !result.assets?.length) {
    return null
  }

  return mapAsset(result.assets[0])
}

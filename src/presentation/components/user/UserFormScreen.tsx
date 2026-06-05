
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native'
import { createUserSchema, type CreateUserInput } from '@/src/domain/rules/userSchema'


const UserFormScreen = () => {
  const { control, handleSubmit, formState: { errors } } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      username: '',
      bio: '',
    },
  })

  const onSubmit = (data: CreateUserInput) => {
    Alert.alert('Succes', 'Donnees valides')
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Nom d&apos;utilisateur</Text>
      <Controller
        control={control}
        name="username"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Entrez un nom"
            autoCapitalize="none"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
          />
        )}
      />
      {errors.username && <Text style={{ color: 'red' }}>{errors.username.message}</Text>}

      <Text style={styles.label}>Bio</Text>
      <Controller
        control={control}
        name="bio"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[styles.input, styles.multiline]}
            placeholder="Courte biographie"
            multiline
            numberOfLines={3}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
          />
        )}
      />
      {errors.bio && <Text style={{ color: 'red' }}>{errors.bio.message}</Text>}

      <View style={styles.button}>
        <Button title="Enregistrer" onPress={handleSubmit(onSubmit)} />
      </View>
    </View>
  )
}

export default UserFormScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  label: {
    marginTop: 8,
    marginBottom: 4,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  button: {
    marginTop: 16,
  },
})


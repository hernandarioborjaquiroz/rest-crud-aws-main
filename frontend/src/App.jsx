import React, { useEffect, useState } from 'react'
import axios from 'axios'
import {
  Box, Container, Heading, Stack, Input, Button,
  SimpleGrid, Text, useToast
} from '@chakra-ui/react'


const API_BASE = import.meta.env.VITE_API_URL 
console.log('[APP] API_BASE =', API_BASE)

export default function App() {
  const [items, setItems] = useState([])
  const [text, setText] = useState('')
  const toast = useToast()

  const load = async () => {
    const { data } = await axios.get(`${API_BASE}/items`)
    setItems(data)
  }

  useEffect(() => { load() }, [])

  const createItem = async () => {
    if (!text.trim()) return
    const { data } = await axios.post(`${API_BASE}/items`, { text })
    setText('')
    toast({ title: 'Creado', status: 'success', duration: 1500 })
    setItems(prev => [data, ...prev])
  }

  const updateItem = async (id) => {
    const val = prompt('Nuevo texto:')
    if (!val) return
    const { data } = await axios.put(`${API_BASE}/items/${id}`, { text: val })
    setItems(prev => prev.map(i => (i.id === id ? data : i)))
  }

  const deleteItem = async (id) => {
    await axios.delete(`${API_BASE}/items/${id}`)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  return (
    <Container maxW="container.lg" py={10}>
      <Heading mb={6} textAlign="center">CRUD Serverless</Heading>

      <Stack direction={{ base: 'column', md: 'row' }} gap={3} mb={6}>
        <Input
          placeholder="Escribe algo..."
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <Button onClick={createItem}>Agregar</Button>
      </Stack>

      <SimpleGrid columns={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing={4}>
        {items.map(it => (
          <Box key={it.id} p={4} borderWidth="1px" borderRadius="lg">
            <Text noOfLines={3}>{it.text}</Text>
            <Stack direction="row" mt={3}>
              <Button size="sm" onClick={() => updateItem(it.id)}>Editar</Button>
              <Button size="sm" variant="outline" onClick={() => deleteItem(it.id)}>Borrar</Button>
            </Stack>
          </Box>
        ))}
      </SimpleGrid>
    </Container>
  )
}


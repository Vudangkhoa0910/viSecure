import React, { useState, useEffect } from 'react'
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Alert,
  CircularProgress,
  InputAdornment
} from '@mui/material'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useAuth } from '../hooks/useAuth'
import { encryptionManager } from '../utils/encryption'
import { VaultItem } from '../utils/storage'
import { backupManager } from '../utils/backup'

const VaultPage: React.FC = () => {
  const { isInitialized, storageManager } = useLocalStorage()
  const { isUnlocked, masterPassword, unlock, lock, isFirstTime, setupMasterPassword, isLoading: authLoading } = useAuth()
  const [items, setItems] = useState<VaultItem[]>([])
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<VaultItem | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [tempPassword, setTempPassword] = useState('')
  const [newItem, setNewItem] = useState<{
    type: 'password' | 'note' | 'file'
    title: string
    username: string
    password: string
    url: string
    notes: string
  }>({
    type: 'password',
    title: '',
    username: '',
    password: '',
    url: '',
    notes: ''
  })

  useEffect(() => {
    if (isInitialized && isUnlocked) {
      loadItems()
    }
  }, [isInitialized, isUnlocked])

  const loadItems = async () => {
    try {
      setLoading(true)
      const vaultItems = await storageManager.getVaultItems()
      setItems(vaultItems)
    } catch (error) {
      console.error('Failed to load vault items:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAuthSubmit = async () => {
    if (!tempPassword) return
    
    let success = false
    if (isFirstTime) {
      success = await setupMasterPassword(tempPassword)
    } else {
      success = await unlock(tempPassword)
    }
    
    if (success) {
      setTempPassword('')
    }
  }

  const handleSaveItem = async () => {
    if (!newItem.title) return

    try {
      setLoading(true)
      
      const itemData = {
        username: newItem.username,
        password: newItem.password,
        url: newItem.url,
        notes: newItem.notes
      }

      const encryptedData = await encryptionManager.encrypt(
        JSON.stringify(itemData), 
        masterPassword
      )

      const item: VaultItem = {
        id: editingItem?.id || Date.now().toString(),
        type: newItem.type,
        title: newItem.title,
        data: encryptedData,
        encrypted: true,
        createdAt: editingItem?.createdAt || new Date(),
        updatedAt: new Date()
      }

      await storageManager.saveVaultItem(item)
      await loadItems()
      handleCloseDialog()
    } catch (error) {
      console.error('Failed to save item:', error)
      alert('Failed to save item')
    } finally {
      setLoading(false)
    }
  }

  const handleEditItem = async (item: VaultItem) => {
    try {
      setLoading(true)
      const decrypted = await encryptionManager.decrypt(item.data, masterPassword)
      const itemData = JSON.parse(decrypted)
      
      setNewItem({
        type: item.type,
        title: item.title,
        username: itemData.username || '',
        password: itemData.password || '',
        url: itemData.url || '',
        notes: itemData.notes || ''
      })
      
      setEditingItem(item)
      setDialogOpen(true)
    } catch (error) {
      console.error('Failed to decrypt item:', error)
      alert('Failed to decrypt item')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteItem = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await storageManager.deleteVaultItem(id)
        await loadItems()
      } catch (error) {
        console.error('Failed to delete item:', error)
      }
    }
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingItem(null)
    setNewItem({
      type: 'password',
      title: '',
      username: '',
      password: '',
      url: '',
      notes: ''
    })
  }

  const generatePassword = () => {
    const password = encryptionManager.generateSecureString(16)
    setNewItem({ ...newItem, password })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const handleExportBackup = async () => {
    try {
      const blob = await backupManager.exportToFile(masterPassword)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `visecure-backup-${new Date().toISOString().split('T')[0]}.vsbak`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed')
    }
  }

  // Show loading spinner while initializing
  if (!isInitialized || authLoading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>
            {!isInitialized ? 'Initializing secure storage...' : 'Loading...'}
          </Typography>
        </Box>
      </Container>
    )
  }

  // Show auth screen if not unlocked
  if (!isUnlocked) {
    return (
      <Container maxWidth="sm">
        <Box display="flex" flexDirection="column" alignItems="center" mt={4}>
          <Typography variant="h4" gutterBottom>
            ViSecure Vault
          </Typography>
          <Typography variant="body1" color="textSecondary" textAlign="center" mb={3}>
            {isFirstTime 
              ? 'Create your master password to secure your vault' 
              : 'Enter your master password to unlock your vault'
            }
          </Typography>
          <TextField
            fullWidth
            type={showPassword ? 'text' : 'password'}
            label={isFirstTime ? 'Create Master Password' : 'Master Password'}
            value={tempPassword}
            onChange={(e) => setTempPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAuthSubmit()}
            margin="normal"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Button
                    size="small"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </Button>
                </InputAdornment>
              )
            }}
          />
          <Button
            variant="contained"
            fullWidth
            onClick={handleAuthSubmit}
            disabled={!tempPassword || authLoading}
            sx={{ mt: 2 }}
          >
            {isFirstTime ? 'Create Vault' : 'Unlock Vault'}
          </Button>
        </Box>
      </Container>
    )
  }

  // Main vault interface
  return (
    <Container>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Vault
        </Typography>
        <Box>
          <Button
            variant="outlined"
            onClick={handleExportBackup}
            sx={{ mr: 1 }}
          >
            Backup
          </Button>
          <Button
            variant="outlined"
            onClick={lock}
          >
            Lock
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : items.length === 0 ? (
        <Alert severity="info">
          Your vault is empty. Add your first password or note to get started.
        </Alert>
      ) : (
        <List>
          {items.map((item) => (
            <Card key={item.id} sx={{ mb: 2 }}>
              <CardContent>
                <ListItem>
                  <ListItemText
                    primary={item.title}
                    secondary={
                      <Box>
                        <Chip
                          label={item.type}
                          size="small"
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="caption" color="textSecondary">
                          {new Date(item.updatedAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Button
                      size="small"
                      onClick={() => handleEditItem(item)}
                      sx={{ mr: 1 }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleDeleteItem(item.id)}
                    >
                      Delete
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
              </CardContent>
            </Card>
          ))}
        </List>
      )}

      <Button
        variant="contained"
        color="primary"
        onClick={() => setDialogOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 80,
          right: 16,
          borderRadius: '50px',
          minWidth: 'auto',
          width: 56,
          height: 56,
        }}
      >
        +
      </Button>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingItem ? 'Edit Item' : 'Add New Item'}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Type</InputLabel>
            <Select
              value={newItem.type}
              onChange={(e) => setNewItem({ ...newItem, type: e.target.value as any })}
            >
              <MenuItem value="password">Password</MenuItem>
              <MenuItem value="note">Secure Note</MenuItem>
              <MenuItem value="file">File</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Title"
            value={newItem.title}
            onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
            margin="normal"
            required
          />

          {newItem.type === 'password' && (
            <>
              <TextField
                fullWidth
                label="Username/Email"
                value={newItem.username}
                onChange={(e) => setNewItem({ ...newItem, username: e.target.value })}
                margin="normal"
              />
              
              <Box display="flex" gap={1}>
                <TextField
                  fullWidth
                  label="Password"
                  value={newItem.password}
                  onChange={(e) => setNewItem({ ...newItem, password: e.target.value })}
                  margin="normal"
                  type="password"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button
                          size="small"
                          onClick={() => copyToClipboard(newItem.password)}
                        >
                          Copy
                        </Button>
                      </InputAdornment>
                    )
                  }}
                />
                <Button
                  onClick={generatePassword}
                  variant="outlined"
                  sx={{ mt: 2 }}
                >
                  Generate
                </Button>
              </Box>

              <TextField
                fullWidth
                label="Website URL"
                value={newItem.url}
                onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
                margin="normal"
              />
            </>
          )}

          <TextField
            fullWidth
            label="Notes"
            value={newItem.notes}
            onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveItem} variant="contained" disabled={loading}>
            {editingItem ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default VaultPage

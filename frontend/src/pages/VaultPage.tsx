import React, { useState, useEffect, memo } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  Alert,
  Fab,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Snackbar,
  CircularProgress,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  GetApp as ExportIcon,
  Publish as ImportIcon,
} from '@mui/icons-material'
import { useAuth } from '../hooks/useAuth'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { VaultItem } from '../utils/storage'
import { encryptionManager } from '../utils/encryption'
import { backupManager } from '../utils/backup'

interface DecryptedVaultData {
  type: 'password' | 'note' | 'file'
  title: string
  username?: string
  password?: string
  url?: string
  notes?: string
}

const VaultPage: React.FC = memo(() => {
  const { isAuthenticated } = useAuth()
  const { isInitialized, storageManager } = useLocalStorage()
  const [items, setItems] = useState<VaultItem[]>([])
  const [decryptedData, setDecryptedData] = useState<Map<string, DecryptedVaultData>>(new Map())
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const [masterPassword, setMasterPassword] = useState('')
  const [vaultUnlocked, setVaultUnlocked] = useState(false)
  const [editingItem, setEditingItem] = useState<VaultItem | null>(null)
  const [newItem, setNewItem] = useState<DecryptedVaultData>({
    type: 'password',
    title: '',
    username: '',
    password: '',
    url: '',
    notes: '',
  })
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  })

  // Unlock vault with master password
  const unlockVault = async (password: string) => {
    try {
      setLoading(true)
      const vaultItems = await storageManager.getVaultItems()
      
      // Try to decrypt one item to verify password
      if (vaultItems.length > 0) {
        await encryptionManager.decrypt(vaultItems[0].data, password)
      }

      setMasterPassword(password)
      setVaultUnlocked(true)
      setPasswordDialogOpen(false)
      await loadItems(password)
    } catch (error) {
      console.error('Failed to unlock vault:', error)
      showSnackbar('Mật khẩu không đúng', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Load vault items
  useEffect(() => {
    if (isAuthenticated && isInitialized && !vaultUnlocked) {
      setPasswordDialogOpen(true)
    }
  }, [isAuthenticated, isInitialized, vaultUnlocked])

  const loadItems = async (password: string = masterPassword) => {
    if (!password) return

    try {
      setLoading(true)
      const vaultItems = await storageManager.getVaultItems()
      setItems(vaultItems)

      // Decrypt all items
      const decryptedMap = new Map<string, DecryptedVaultData>()
      for (const item of vaultItems) {
        try {
          const decrypted = await encryptionManager.decrypt(item.data, password)
          const data = JSON.parse(decrypted) as DecryptedVaultData
          decryptedMap.set(item.id, data)
        } catch (error) {
          console.error(`Failed to decrypt item ${item.id}:`, error)
        }
      }
      setDecryptedData(decryptedMap)
    } catch (error) {
      console.error('Failed to load vault items:', error)
      showSnackbar('Không thể tải vault items', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveItem = async () => {
    if (!masterPassword) return

    try {
      if (!newItem.title.trim()) {
        showSnackbar('Vui lòng nhập tiêu đề', 'error')
        return
      }

      // Encrypt the data
      const dataToEncrypt = JSON.stringify(newItem)
      const encryptedData = await encryptionManager.encrypt(dataToEncrypt, masterPassword)

      const itemData: VaultItem = {
        id: editingItem?.id || crypto.randomUUID(),
        type: newItem.type,
        title: newItem.title,
        data: encryptedData,
        createdAt: editingItem?.createdAt || new Date(),
        updatedAt: new Date(),
        encrypted: true,
      }

      await storageManager.saveVaultItem(itemData)
      
      if (editingItem) {
        showSnackbar('Cập nhật thành công', 'success')
      } else {
        showSnackbar('Thêm mới thành công', 'success')
      }

      await loadItems()
      handleCloseDialog()
    } catch (error) {
      console.error('Failed to save item:', error)
      showSnackbar('Lỗi khi lưu item', 'error')
    }
  }

  const handleDeleteItem = async (id: string) => {
    try {
      await storageManager.deleteVaultItem(id)
      await loadItems()
      showSnackbar('Xóa thành công', 'success')
    } catch (error) {
      console.error('Failed to delete item:', error)
      showSnackbar('Lỗi khi xóa item', 'error')
    }
  }

  const handleEditItem = (item: VaultItem) => {
    const decrypted = decryptedData.get(item.id)
    if (!decrypted) return

    setEditingItem(item)
    setNewItem({ ...decrypted })
    setDialogOpen(true)
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
      notes: '',
    })
  }

  const handleCopyToClipboard = async (item: VaultItem) => {
    const decrypted = decryptedData.get(item.id)
    if (!decrypted) return

    const textToCopy = decrypted.password || decrypted.notes || ''
    try {
      await navigator.clipboard.writeText(textToCopy)
      showSnackbar('Đã sao chép', 'success')
    } catch (error) {
      console.error('Failed to copy:', error)
      showSnackbar('Lỗi khi sao chép', 'error')
    }
  }

  const handleExport = async () => {
    if (!masterPassword) return

    try {
      const blob = await backupManager.exportToFile(masterPassword)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `visecure-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      showSnackbar('Xuất dữ liệu thành công', 'success')
    } catch (error) {
      console.error('Export failed:', error)
      showSnackbar('Lỗi khi xuất dữ liệu', 'error')
    }
  }

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity })
  }

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'password':
        return '🔐'
      case 'note':
        return '📝'
      case 'file':
        return '📁'
      default:
        return '🔐'
    }
  }

  if (!isAuthenticated) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Typography>Vui lòng đăng nhập để truy cập Vault</Typography>
      </Box>
    )
  }

  if (!vaultUnlocked) {
    return (
      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Mở khóa Vault</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Master Password"
            type="password"
            fullWidth
            margin="normal"
            value={masterPassword}
            onChange={(e) => setMasterPassword(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                unlockVault(masterPassword)
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialogOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={() => unlockVault(masterPassword)} disabled={!masterPassword || loading}>
            {loading ? <CircularProgress size={20} /> : 'Mở khóa'}
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

  if (loading && items.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ p: 2, pb: 10 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Vault
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Quản lý mật khẩu và thông tin bảo mật
        </Typography>
      </Box>

      {/* Quick Actions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Thao tác nhanh
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<ExportIcon />}
                onClick={handleExport}
              >
                Xuất dữ liệu
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<ImportIcon />}
                disabled
              >
                Nhập dữ liệu
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Vault Items */}
      {items.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Chưa có mật khẩu nào
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Thêm mật khẩu đầu tiên để bắt đầu
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setDialogOpen(true)}
            >
              Thêm mật khẩu
            </Button>
          </CardContent>
        </Card>
      ) : (
        <List>
          {items.map((item) => (
            <Card key={item.id} sx={{ mb: 2 }}>
              <ListItem
                secondaryAction={
                  <Box>
                    <IconButton
                      onClick={() => handleCopyToClipboard(item)}
                      size="small"
                    >
                      <CopyIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleEditItem(item)}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteItem(item.id)}
                      size="small"
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>{getItemIcon(item.type)}</span>
                      <Typography variant="body1" fontWeight="medium">
                        {item.title}
                      </Typography>
                      <Chip label={item.type} size="small" variant="outlined" />
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      {decryptedData.get(item.id)?.username && (
                        <Typography variant="body2" color="text.secondary">
                          Username: {decryptedData.get(item.id)?.username}
                        </Typography>
                      )}
                      {decryptedData.get(item.id)?.url && (
                        <Typography variant="body2" color="text.secondary">
                          URL: {decryptedData.get(item.id)?.url}
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.disabled">
                        Cập nhật: {new Date(item.updatedAt).toLocaleDateString('vi-VN')}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            </Card>
          ))}
        </List>
      )}

      {/* Add Button */}
      <Fab
        color="primary"
        onClick={() => setDialogOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 90,
          right: 20,
        }}
      >
        <AddIcon />
      </Fab>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingItem ? 'Chỉnh sửa' : 'Thêm mới'}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Loại</InputLabel>
            <Select
              value={newItem.type}
              onChange={(e) => setNewItem({ ...newItem, type: e.target.value as 'password' | 'note' | 'file' })}
            >
              <MenuItem value="password">Mật khẩu</MenuItem>
              <MenuItem value="note">Ghi chú</MenuItem>
              <MenuItem value="file">File</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Tiêu đề"
            value={newItem.title}
            onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
            fullWidth
            margin="normal"
          />

          {newItem.type === 'password' && (
            <>
              <TextField
                label="Username/Email"
                value={newItem.username}
                onChange={(e) => setNewItem({ ...newItem, username: e.target.value })}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Mật khẩu"
                type="password"
                value={newItem.password}
                onChange={(e) => setNewItem({ ...newItem, password: e.target.value })}
                fullWidth
                margin="normal"
              />
              <TextField
                label="URL"
                value={newItem.url}
                onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
                fullWidth
                margin="normal"
              />
            </>
          )}

          <TextField
            label="Ghi chú"
            value={newItem.notes}
            onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
            fullWidth
            margin="normal"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button variant="contained" onClick={handleSaveItem}>
            {editingItem ? 'Cập nhật' : 'Thêm'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
})

VaultPage.displayName = 'VaultPage'

export { VaultPage }
export default VaultPage

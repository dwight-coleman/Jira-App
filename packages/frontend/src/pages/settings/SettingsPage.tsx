import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Divider,
  Skeleton,
  Button,
  IconButton,
  Tooltip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ExpandMoreIcon,
  Tabs,
  Tab,
  Slider,
  Alert,
  AlertTitle,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Palette as PaletteIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Storage as StorageIcon,
  SmartToy as SmartToyIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Key as KeyIcon,
  Cloud as CloudIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import api from '../../services/api';
import { format } from 'date-fns';

export default function SettingsPage() {
  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => api.get('/settings').then(r => r.data),
  });

  const [tab, setTab] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={120} width="100%" sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          {[...Array(3)].map((_, i) => (
            <Grid item xs={12} md={4} key={i}>
              <Skeleton variant="rectangular" height={300} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  const s = settings || {};

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <SettingsIcon color="primary" /> Settings
      </Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth" sx={{ mb: 3 }}>
        <Tab label="General" icon={<DescriptionIcon />} />
        <Tab label="AI & ML" icon={<SmartToyIcon />} />
        <Tab label="Integrations" icon={<CloudIcon />} />
        <Tab label="Security" icon={<SecurityIcon />} />
        <Tab label="Notifications" icon={<NotificationsIcon />} />
        <Tab label="Appearance" icon={<PaletteIcon />} />
      </Tabs>

      {/* General Tab */}
      {tab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>General Settings</Typography>
                <TextField fullWidth label="Application Name" defaultValue={s.general?.appName || 'Jira Executive Reporting'} sx={{ mb: 2 }} />
                <TextField fullWidth multiline rows={3} label="Description" defaultValue={s.general?.appDescription || ''} sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Timezone</InputLabel>
                      <Select defaultValue={s.general?.timezone || 'America/New_York'}>
                        <MenuItem value="America/New_York">Eastern Time (ET)</MenuItem>
                        <MenuItem value="America/Chicago">Central Time (CT)</MenuItem>
                        <MenuItem value="America/Denver">Mountain Time (MT)</MenuItem>
                        <MenuItem value="America/Los_Angeles">Pacific Time (PT)</MenuItem>
                        <MenuItem value="UTC">UTC</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Date Format</InputLabel>
                      <Select defaultValue={s.general?.dateFormat || 'MM/dd/yyyy'}>
                        <MenuItem value="MM/dd/yyyy">MM/DD/YYYY</MenuItem>
                        <MenuItem value="dd/MM/yyyy">DD/MM/YYYY</MenuItem>
                        <MenuItem value="yyyy-MM-dd">YYYY-MM-DD</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Currency</InputLabel>
                      <Select defaultValue={s.general?.currency || 'USD'}>
                        <MenuItem value="USD">USD ($)</MenuItem>
                        <MenuItem value="EUR">EUR (€)</MenuItem>
                        <MenuItem value="GBP">GBP (£)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Language</InputLabel>
                      <Select defaultValue={s.general?.language || 'en'}>
                        <MenuItem value="en">English</MenuItem>
                        <MenuItem value="es">Spanish</MenuItem>
                        <MenuItem value="fr">French</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
                <Box sx={{ mt: 3, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  <Button variant="outlined">Cancel</Button>
                  <Button variant="contained" startIcon={<SaveIcon />}>Save Changes</Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Quick Actions</Typography>
                <Button fullWidth variant="outlined" startIcon={<RefreshIcon />} sx={{ mb: 1 }}>
                  Refresh Data
                </Button>
                <Button fullWidth variant="outlined" startIcon={<VisibilityIcon />} sx={{ mb: 1 }}>
                  View System Status
                </Button>
                <Button fullWidth variant="outlined" startIcon={<DescriptionIcon />} sx={{ mb: 1 }}>
                  Export Configuration
                </Button>
                <Button fullWidth variant="outlined" startIcon={<CloudIcon />} sx={{ mb: 1 }}>
                  Import Configuration
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* AI & ML Tab */}
      {tab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>AI Provider Configuration</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Default AI Provider</InputLabel>
                      <Select defaultValue={s.ai?.defaultProvider || 'mock-ai'}>
                        <MenuItem value="mock-ai">Mock AI (Demo)</MenuItem>
                        <MenuItem value="openai-gpt4">OpenAI GPT-4</MenuItem>
                        <MenuItem value="openai-gpt35">OpenAI GPT-3.5 Turbo</MenuItem>
                        <MenuItem value="anthropic-claude">Anthropic Claude</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="OpenAI API Key"
                      type={showPassword ? 'text' : 'password'}
                      defaultValue={s.ai?.credentials?.openaiApiKey || ''}
                      InputProps={{
                        endAdornment: (
                          <IconButton onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Anthropic API Key"
                      type={showPassword ? 'text' : 'password'}
                      defaultValue={s.ai?.credentials?.anthropicApiKey || ''}
                      InputProps={{
                        endAdornment: (
                          <IconButton onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Model</InputLabel>
                      <Select defaultValue={s.ai?.config?.model || 'mock-ai-v1'}>
                        <MenuItem value="mock-ai-v1">Mock AI v1</MenuItem>
                        <MenuItem value="gpt-4-turbo">GPT-4 Turbo</MenuItem>
                        <MenuItem value="gpt-3.5-turbo">GPT-3.5 Turbo</MenuItem>
                        <MenuItem value="claude-3-opus">Claude 3 Opus</MenuItem>
                        <MenuItem value="claude-3-sonnet">Claude 3 Sonnet</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>AI Analysis Settings</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch checked={s.ai?.autoAnalyzeNewTickets} onChange={() => {}} />
                      }
                      label="Auto-analyze new tickets"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch checked={s.ai?.enabled} onChange={() => {}} />
                      }
                      label="Enable AI features"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Batch Size"
                      defaultValue={s.ai?.batchSize || 10}
                      InputProps={{ inputProps: { min: 1, max: 100 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Confidence Threshold"
                      defaultValue={s.ai?.confidenceThreshold || 0.7}
                      InputProps={{ inputProps: { min: 0, max: 1, step: 0.05 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Retain Analyses (days)"
                      defaultValue={s.ai?.retainAnalyses || 90}
                      InputProps={{ inputProps: { min: 1, max: 365 } }}
                    />
                  </Grid>
                </Grid>
                <Box sx={{ mt: 3, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  <Button variant="contained" startIcon={<SaveIcon />}>Save AI Settings</Button>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>SLA Targets</Typography>
                <Grid container spacing={2}>
                  {(['Critical', 'High', 'Medium', 'Low'] as const).map((priority) => (
                    <Grid item xs={12} sm={6} md={3} key={priority}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="caption" color="text.secondary">{priority} Priority</Typography>
                          <Grid container spacing={1}>
                            <Grid item xs={6}>
                              <TextField
                                fullWidth
                                size="small"
                                type="number"
                                label="Response (min)"
                                defaultValue={s.tickets?.slaTargets?.[priority]?.response || (priority === 'Critical' ? 30 : priority === 'High' ? 60 : priority === 'Medium' ? 120 : 240)}
                              />
                            </Grid>
                            <Grid item xs={6}>
                              <TextField
                                fullWidth
                                size="small"
                                type="number"
                                label="Resolution (min)"
                                defaultValue={s.tickets?.slaTargets?.[priority]?.resolution || (priority === 'Critical' ? 240 : priority === 'High' ? 480 : priority === 'Medium' ? 1440 : 10080)}
                              />
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Integrations Tab */}
      {tab === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>Jira Service Management Integration</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Jira Base URL" placeholder="https://your-domain.atlassian.net" defaultValue={s.integrations?.jira?.baseUrl || ''} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Authentication Type</InputLabel>
                  <Select defaultValue={s.integrations?.jira?.authType || 'bearer'}>
                    <MenuItem value="bearer">Bearer Token</MenuItem>
                    <MenuItem value="basic">Basic Auth</MenuItem>
                    <MenuItem value="oauth">OAuth 2.0</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Bearer Token" type="password" placeholder="Enter API token" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Project Keys (comma-separated)" placeholder="IT, HR, FIN" defaultValue={s.integrations?.jira?.projectKeys?.join(', ') || ''} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Service Desk IDs (comma-separated)" placeholder="1, 2, 3" defaultValue={s.integrations?.jira?.serviceDeskIds?.join(', ') || ''} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={<Switch checked={s.integrations?.jira?.enabled || false} onChange={() => {}} />}
                  label="Enable Jira Integration"
                />
              </Grid>
            </Grid>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Sync Fields</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {['summary', 'description', 'priority', 'status', 'assignee', 'reporter', 'created', 'updated', 'resolution', 'labels', 'components', 'fixVersions', 'affectsVersions'].map((field) => (
                <FormControlLabel
                  key={field}
                  control={<Switch defaultChecked={s.integrations?.jira?.syncFields?.includes(field)} onChange={() => {}} />}
                  label={field}
                />
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Security Tab */}
      {tab === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>Session & Authentication</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth type="number" label="Session Timeout (seconds)" defaultValue={s.security?.sessionTimeout || 3600} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth type="number" label="Max Login Attempts" defaultValue={s.security?.maxLoginAttempts || 5} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth type="number" label="Lockout Duration (seconds)" defaultValue={s.security?.lockoutDuration || 900} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={<Switch checked={s.security?.twoFactor?.enabled || false} onChange={() => {}} />}
                      label="Enable Two-Factor Authentication"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>Password Policy</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth type="number" label="Minimum Length" defaultValue={s.security?.passwordPolicy?.minLength || 12} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth type="number" label="Max Age (days)" defaultValue={s.security?.passwordPolicy?.maxAge || 90} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth type="number" label="History Count" defaultValue={s.security?.passwordPolicy?.historyCount || 5} />
                  </Grid>
                </Grid>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <FormControlLabel control={<Switch defaultChecked={s.security?.passwordPolicy?.requireUppercase} onChange={() => {}} />} label="Require Uppercase" />
                  <FormControlLabel control={<Switch defaultChecked={s.security?.passwordPolicy?.requireLowercase} onChange={() => {}} />} label="Require Lowercase" />
                  <FormControlLabel control={<Switch defaultChecked={s.security?.passwordPolicy?.requireNumbers} onChange={() => {}} />} label="Require Numbers" />
                  <FormControlLabel control={<Switch defaultChecked={s.security?.passwordPolicy?.requireSpecialChars} onChange={() => {}} />} label="Require Special Characters" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Notifications Tab */}
      {tab === 4 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>Notification Channels</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
              <FormControlLabel control={<Switch defaultChecked={s.notifications?.channels?.includes('inApp')} onChange={() => {}} />} label="In-App" />
              <FormControlLabel control={<Switch defaultChecked={s.notifications?.channels?.includes('email')} onChange={() => {}} />} label="Email" />
              <FormControlLabel control={<Switch defaultChecked={s.notifications?.channels?.includes('slack')} onChange={() => {}} />} label="Slack" />
              <FormControlLabel control={<Switch defaultChecked={s.notifications?.channels?.includes('webhook')} onChange={() => {}} />} label="Webhook" />
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Default Channel</Typography>
            <FormControl>
              <InputLabel>Default</InputLabel>
              <Select defaultValue={s.notifications?.defaultChannel || 'inApp'}>
                <MenuItem value="inApp">In-App</MenuItem>
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="slack">Slack</MenuItem>
              </Select>
            </FormControl>
          </CardContent>
        </Card>
      )}

      {/* Appearance Tab */}
      {tab === 5 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>Theme</Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  <Button variant="outlined" startIcon={<VisibilityIcon />}>Light</Button>
                  <Button variant="outlined" startIcon={<VisibilityOffIcon />}>Dark</Button>
                  <Button variant="outlined" startIcon={<PaletteIcon />}>System</Button>
                </Box>
                <FormControlLabel
                  control={<Switch defaultChecked={true} onChange={() => {}} />}
                  label="Auto-detect system theme"
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>Density</Typography>
                <Slider
                  defaultValue={2}
                  min={1}
                  max={3}
                  step={1}
                  marks={[
                    { value: 1, label: 'Compact' },
                    { value: 2, label: 'Standard' },
                    { value: 3, label: 'Comfortable' },
                  ]}
                  valueLabelDisplay="auto"
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
import { useParams } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import api, { Ticket } from '../../services/api';

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: ticket, isLoading, error } = useQuery<Ticket>(
    ['ticket', id],
    async () => {
      const resp = await api.get(`/tickets/${id}`);
      return resp.data;
    },
    { enabled: !!id }
  );

  if (isLoading) return <Box sx={{ p: 3 }}><Typography>Loading...</Typography></Box>;
  if (error) return <Box sx={{ p: 3 }}><Typography color="error">Error loading ticket.</Typography></Box>;
  if (!ticket) return <Box sx={{ p: 3 }}><Typography>Ticket not found.</Typography></Box>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>{ticket.key}: {ticket.summary}</Typography>
      <Typography variant="body1" sx={{ mb: 1 }}>{ticket.description}</Typography>
      <Typography>Priority: {ticket.priority}</Typography>
      <Typography>Status: {ticket.status}</Typography>
      <Typography>Application: {ticket.application}</Typography>
      {/* Add more fields as needed */}
    </Box>
  );
}

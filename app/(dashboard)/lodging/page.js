import { redirect } from 'next/navigation'

// This used to be a separate, more limited room-management page (add-only,
// no edit/delete, card grid) that predated the full Rooms build at
// /lodging/rooms — found during a full-codebase audit sitting live and
// linked from the sidebar this whole time, alongside the newer page it
// duplicates. Redirecting rather than deleting outright, so anyone with
// this URL bookmarked lands somewhere real instead of a 404.
export default function LodgingRedirect() {
  redirect('/lodging/rooms')
}

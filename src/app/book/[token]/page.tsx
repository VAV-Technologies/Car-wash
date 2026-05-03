// Stale-token redirect. The unique-token booking system was removed; one shared
// /book form replaces it. Old WhatsApp messages may still link here.
import { redirect } from 'next/navigation'

export default function StaleTokenRedirect() {
  redirect('/book')
}

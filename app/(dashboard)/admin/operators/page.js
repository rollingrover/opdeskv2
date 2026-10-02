import { redirect } from 'next/navigation'

// OpDesk's own public operator profiles were retired in favour of the
// ZAtours / Route22 directory — managed at /admin/directory.
export default function Page() {
  redirect('/admin/directory')
}

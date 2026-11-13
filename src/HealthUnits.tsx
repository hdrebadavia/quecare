import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { api } from './api';
import { Empty, ErrorBox, Field, Form, Loading, Modal, useLoad, value, type Facility } from './ui';

type ManagedUnit = Facility & { assignedUserCount: number; canDelete: boolean; deletionBlockers: { label: string; count: number }[] };
type Details = Pick<Facility, 'name' | 'address' | 'announcement'>;
const labels = { name: 'Name', address: 'Address', announcement: 'Announcement' };
export function HealthUnits({ reload, onChange, notify }: { reload: number; onChange: () => void; notify: (message: string, error?: boolean) => void }) {
  const { data, error } = useLoad<ManagedUnit[]>('/admin/facilities', reload);
  const [editor, setEditor] = useState<Facility | null | undefined>(undefined);
  const [remove, setRemove] = useState<ManagedUnit | null>(null);
  return <>
    <div className="section-heading"><div><h2>Health Units</h2><p>Manage the units available throughout QueCare.</p></div><button className="button primary" onClick={() => setEditor(null)}><Plus size={17}/>Add Health Unit</button></div>
    <ErrorBox message={error}/>
    {!data ? <Loading/> : !data.length ? <Empty title="No Health Units configured">Add a Health Unit to get started.</Empty> : <section className="panel table-scroll"><table><thead><tr><th>Health Unit</th><th>Assigned users</th><th>Deletion eligibility</th><th>Actions</th></tr></thead><tbody>{data.map(f => <tr key={f.id}>
      <td><strong>{f.name}</strong><small>{f.address || 'No address provided'}</small></td><td>{f.assignedUserCount}</td><td>{f.canDelete ? 'Unused — can be deleted' : <><strong>Cannot delete</strong>{f.deletionBlockers.map(b => <small key={b.label}>{b.label}: {b.count}</small>)}</>}</td>
      <td><div className="actions"><button className="button secondary small" onClick={() => setEditor(f)}><Pencil size={14}/>Edit</button><button className="button secondary small danger-text" disabled={!f.canDelete} aria-label={`Delete ${f.name}`} onClick={() => setRemove(f)}><Trash2 size={14}/>Delete</button></div></td>
    </tr>)}</tbody></table></section>}
    {editor !== undefined && <UnitEditor key={editor?.id || 'new'} unit={editor} onClose={() => setEditor(undefined)} onSave={async details => {
      await api(editor ? `/admin/facilities/${editor.id}` : '/admin/facilities', editor ? 'PUT' : 'POST', details);
      notify(editor ? 'Health Unit updated.' : 'Health Unit created. Configure its queue stations and staff through Administration.');
      setEditor(undefined); onChange();
    }}/>}
    {remove && <Modal title={`Delete ${remove.name}?`} onClose={() => setRemove(null)}><p>Deleting this Health Unit is permanent. The server will check again that it has no assigned users or linked operational data.</p><Form label="Delete Health Unit permanently" onSubmit={async () => {
      try { await api(`/admin/facilities/${remove.id}`, 'DELETE'); } catch (e) { onChange(); throw e; }
      setRemove(null); onChange(); notify('Health Unit deleted.');
    }}><label className="checkbox"><input type="checkbox" required/>I confirm permanent deletion of {remove.name}.</label></Form></Modal>}
  </>;
}
function UnitEditor({ unit, onClose, onSave }: { unit: Facility | null; onClose: () => void; onSave: (details: Details) => Promise<void> }) {
  const [draft, setDraft] = useState<Details>({ name: unit?.name || '', address: unit?.address || '', announcement: unit?.announcement || '' });
  const [review, setReview] = useState(false);
  const changes = (Object.keys(labels) as (keyof Details)[]).filter(key => unit && unit[key] !== draft[key]);
  return <Modal title={review ? 'Confirm Health Unit changes' : unit ? 'Edit Health Unit' : 'Add Health Unit'} onClose={onClose}>
    {review ? <Form key="review" label="Confirm and save changes" onSubmit={async () => onSave(draft)}>
      <div className="alert" role="alert">Users and records remain linked to this Health Unit. Updated information will appear wherever this unit is displayed.{changes.includes('name') && ' Historical records will display the new name.'}</div>
      {changes.map(key => <div className="padded" key={key}><strong>{labels[key]}</strong><p className="preserve-lines">Before: {unit![key] || '(empty)'}</p><p className="preserve-lines">After: {draft[key] || '(empty)'}</p></div>)}
      <label className="checkbox"><input type="checkbox" required/>I have reviewed these changes.</label><button type="button" className="button secondary" onClick={() => setReview(false)}>Back to editing</button>
    </Form> : <Form key="edit" label={unit ? 'Review changes' : 'Create Health Unit'} onSubmit={async d => {
      const details = { name: value(d, 'name').trim(), address: value(d, 'address').trim(), announcement: value(d, 'announcement') };
      if (!details.name) throw new Error('Enter a Health Unit name.');
      setDraft(details);
      if (unit) { if ((Object.keys(labels) as (keyof Details)[]).every(key => unit[key] === details[key])) throw new Error('No changes to save.'); setReview(true); }
      else await onSave(details);
    }}>
      {!unit && <p>New units start without staff, queue stations, or daily sessions. Configure staff and stations through Administration after creation.</p>}
      <Field label="Health Unit name"><input name="name" required maxLength={200} value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })}/></Field>
      <Field label="Address"><textarea name="address" maxLength={1000} value={draft.address} onChange={e => setDraft({ ...draft, address: e.target.value })}/></Field>
      <Field label="Announcement"><textarea name="announcement" rows={4} maxLength={500} value={draft.announcement} onChange={e => setDraft({ ...draft, announcement: e.target.value })}/></Field>
    </Form>}
  </Modal>;
}

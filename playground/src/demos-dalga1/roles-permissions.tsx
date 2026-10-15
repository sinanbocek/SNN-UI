// roles-permissions örneği. Roller ve kişiler uydurmadır.
import { useState } from "react";
import { RolesPermissions } from "../../../registry/components/roles-permissions/roles-permissions";
import type { PermissionGroup, PermissionRole } from "../../../registry/components/roles-permissions/roles-permissions";

const roles: PermissionRole[] = [
  { id: "owner", name: "Sahip", memberCount: 1, owner: true },
  { id: "admin", name: "Yönetici", memberCount: 2 },
  { id: "editor", name: "Editör", memberCount: 5 },
  { id: "viewer", name: "Okuyucu", memberCount: 9 },
];

const groups: PermissionGroup[] = [
  { id: "projects", label: "Projeler", permissions: [{ id: "p-view", label: "Projeleri görüntüle" }, { id: "p-edit", label: "Projeleri düzenle" }, { id: "p-delete", label: "Projeleri sil" }] },
  { id: "members", label: "Üyeler", permissions: [{ id: "m-view", label: "Üyeleri görüntüle" }, { id: "m-invite", label: "Üyeleri davet et" }, { id: "m-remove", label: "Üyeleri çıkar" }] },
  { id: "billing", label: "Faturalama", permissions: [{ id: "b-view", label: "Faturaları görüntüle" }, { id: "b-manage", label: "Ödeme yöntemini yönet" }] },
  { id: "security", label: "Güvenlik", permissions: [{ id: "s-log", label: "Denetim kaydını gör" }, { id: "s-policy", label: "Oturum kurallarını değiştir" }] },
];

const initial: Record<string, string[]> = {
  admin: ["p-view", "p-edit", "p-delete", "m-view", "m-invite", "m-remove", "b-view", "s-log"],
  editor: ["p-view", "p-edit", "m-view"],
  viewer: ["p-view"],
};

const people = ["Nilay Karaca", "Barış Tunç", "Ece Yalın", "İsmail Öztaş", "Şule Demirtaş", "Ozan Gür"].map(name => ({ name }));

export function RolesPermissionsDemo() {
  const [values, setValues] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [empty, setEmpty] = useState(false);
  const [fail, setFail] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [width, setWidth] = useState(900);
  return (
    <div className="col">
      <span className="etiket">Ok tuşlarıyla gezin, Boşluk ile değiştirin; grup kutusu hepsini açar. Sahip sütunu kilitlidir. Altta çubuktan «Gözden geçir».</span>
      <div className="row">
        <label className="row"><input type="checkbox" checked={loading} onChange={event => setLoading(event.target.checked)} /> Yükleniyor</label>
        <label className="row"><input type="checkbox" checked={empty} onChange={event => setEmpty(event.target.checked)} /> Rol yok</label>
        <label className="row"><input type="checkbox" checked={fail} onChange={event => setFail(event.target.checked)} /> Kaydetme başarısız olsun</label>
        <label className="row"><input type="checkbox" checked={collapsed} onChange={event => setCollapsed(event.target.checked)} /> Gruplar kapalı başlasın</label>
        <label className="row">Genişlik <input type="range" min={340} max={900} value={width} onChange={event => setWidth(Number(event.target.value))} /></label>
      </div>
      <div style={{ width, maxWidth: "100%" }}>
        <RolesPermissions
          key={String(collapsed)} roles={empty ? [] : roles} groups={groups} values={values} members={people} loading={loading} collapsedByDefault={collapsed}
          roleMenu={role => (role.owner ? [] : [{ label: "Rolü çoğalt" }, { label: "Adı değiştir" }, { label: "Sil", destructive: true, separatorBefore: true }])}
          onCreateRole={() => setEmpty(false)}
          onSave={changes => new Promise<void>((resolve, reject) => setTimeout(() => {
            if (fail) { reject(new Error("fail")); return; }
            setValues(current => {
              const next = { ...current };
              for (const change of changes) {
                const list = new Set(next[change.roleId] ?? []);
                if (change.granted) list.add(change.permissionId); else list.delete(change.permissionId);
                next[change.roleId] = [...list];
              }
              return next;
            });
            resolve();
          }, 700))}
        />
      </div>
    </div>
  );
}

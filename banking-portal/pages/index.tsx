import { useEffect, useState } from 'react';

export default function BankingPortal() {
  const [groups, setGroups] = useState([]);
  useEffect(() => {
    fetch('/api/tontines').then(res => res.json()).then(setGroups);
  }, []);
  return (
    <div style={{ padding: 20 }}>
      <h1>Tableau de bord Banque Partenaire</h1>
      <table border={1} cellPadding={8}>
        <thead><tr><th>Groupe</th><th>Cotisation moyenne</th><th>Fiabilité</th><th>Action</th></tr></thead>
        <tbody>
          {groups.map(g => (
            <tr key={g.id}>
              <td>{g.name}</td>
              <td>{g.avg_contribution}</td>
              <td>{(g.reliability*100).toFixed(0)}%</td>
              <td><button>Proposer un prêt</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

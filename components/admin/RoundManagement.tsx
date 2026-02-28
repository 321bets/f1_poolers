
import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { Round } from '../../types';

const RoundManagement: React.FC = () => {
    const { rounds, events, createRound, updateRound, deleteRound } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRound, setEditingRound] = useState<Round | null>(null);
    const [roundData, setRoundData] = useState({ number: '', name: '', circuit: '', location: '' });

    const handleOpenModal = (round: Round | null) => {
        if (round) {
            setEditingRound(round);
            setRoundData({
                number: String(round.number),
                name: round.name,
                circuit: round.circuit,
                location: round.location
            });
        } else {
            setEditingRound(null);
            setRoundData({ number: String(rounds.length + 1), name: '', circuit: '', location: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            name: roundData.name,
            circuit: roundData.circuit,
            location: roundData.location,
            number: Number(roundData.number),
        };

        if (editingRound) {
            await updateRound({ ...payload, id: editingRound.id });
        } else {
            await createRound(payload);
        }
        setIsModalOpen(false);
    };

  return (
    <>
    <div className="bg-gray-800 rounded-lg shadow-xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-red-500">Round Management</h2>
        <button 
          onClick={() => handleOpenModal(null)}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          <i className="fas fa-plus mr-2"></i>
          Add New Round
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-700 rounded-lg">
          <thead>
            <tr className="bg-gray-900">
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300">Round #</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300">Round Name</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300">Location</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300">Circuit</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {rounds.map((round) => (
              <tr key={round.id} className="hover:bg-gray-600">
                <td className="py-3 px-4 text-sm text-white">{round.number}</td>
                <td className="py-3 px-4 text-sm text-white">{round.name}</td>
                <td className="py-3 px-4 text-sm text-white">{round.location}</td>
                <td className="py-3 px-4 text-sm text-white">{round.circuit}</td>
                <td className="py-3 px-4 text-sm space-x-4">
                  <button onClick={() => handleOpenModal(round)} className="text-blue-400 hover:text-blue-300" title="Edit Round">
                    <i className="fas fa-edit"></i>
                  </button>
                  <button 
                    onClick={async () => {
                      if (events.some(e => e.roundId === round.id)) {
                        alert('Cannot delete round with existing events. Delete events first.');
                        return;
                      }
                      if (window.confirm(`Are you sure you want to delete round "${round.name}"?`)) {
                        try {
                          await deleteRound(round.id);
                        } catch (err: any) {
                          alert(err.message || 'Error deleting round');
                        }
                      }
                    }} 
                    className="text-red-400 hover:text-red-300" 
                    title="Delete Round"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg">
                <form onSubmit={handleSubmit}>
                    <div className="p-4 border-b border-gray-700">
                        <h2 className="text-xl font-bold text-white">{editingRound ? 'Edit Round' : 'Create New Round'}</h2>
                    </div>
                    <div className="p-4 space-y-4">
                         <div>
                            <label className="block text-gray-400 text-sm font-bold mb-2">Round Number</label>
                            <input type="number" value={roundData.number} onChange={e => setRoundData({...roundData, number: e.target.value})} className="w-full bg-gray-700 text-white rounded-md py-2 px-3" required/>
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm font-bold mb-2">Round Name</label>
                            <input type="text" value={roundData.name} onChange={e => setRoundData({...roundData, name: e.target.value})} placeholder="e.g., Monaco Grand Prix" className="w-full bg-gray-700 text-white rounded-md py-2 px-3" required/>
                        </div>
                         <div>
                            <label className="block text-gray-400 text-sm font-bold mb-2">Location</label>
                            <input type="text" value={roundData.location} onChange={e => setRoundData({...roundData, location: e.target.value})} placeholder="e.g., Monaco" className="w-full bg-gray-700 text-white rounded-md py-2 px-3" required/>
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm font-bold mb-2">Circuit</label>
                            <input type="text" value={roundData.circuit} onChange={e => setRoundData({...roundData, circuit: e.target.value})} placeholder="e.g., Circuit de Monaco" className="w-full bg-gray-700 text-white rounded-md py-2 px-3" required/>
                        </div>
                    </div>
                    <div className="p-4 bg-gray-900 flex justify-end space-x-2">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded">Cancel</button>
                        <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">{editingRound ? 'Update Round' : 'Create Round'}</button>
                    </div>
                </form>
            </div>
        </div>
    )}
    </>
  );
};

export default RoundManagement;

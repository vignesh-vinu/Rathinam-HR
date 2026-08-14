import React, { useEffect, useState } from 'react';
import { Layers, FileText, Plus, CheckCircle2, ChevronLeft, Search } from 'lucide-react';
import { api } from '../../services/api';
import { PDFFieldMapping } from '../../types';

interface PDFFieldMapperPageProps {
  onNavigate: (view: string, param?: any) => void;
}

export const PDFFieldMapperPage: React.FC<PDFFieldMapperPageProps> = ({ onNavigate }) => {
  const [docRef, setDocRef] = useState('');
  const [mappings, setMappings] = useState<PDFFieldMapping[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State for adding dynamic custom field mapping
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPdfField, setNewPdfField] = useState('');
  const [newWebFormField, setNewWebFormField] = useState('');
  const [newCategory, setNewCategory] = useState('Personal');

  const fetchMappings = async () => {
    setLoading(true);
    try {
      const data = await api.getPDFMapping();
      setDocRef(data.docRef || 'RGI/3HR/3F6R3 001');
      setMappings(data.pdfFieldMappings || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMappings();
  }, []);

  const handleAddMapping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPdfField || !newWebFormField) return;
    try {
      await api.addPDFMapping({
        pdfField: newPdfField,
        webFormField: newWebFormField,
        category: newCategory,
        pdfRef: 'Custom Admin Addition'
      });
      setShowAddModal(false);
      setNewPdfField('');
      setNewWebFormField('');
      fetchMappings();
    } catch (err: any) {
      alert(err.message || 'Failed to add mapping');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fadeIn pb-24">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => onNavigate('admin-dashboard')}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 text-slate-300 text-xs font-bold border border-slate-800 mb-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 text-xs font-extrabold uppercase rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              PDF Schema Architecture
            </span>
            <span className="text-xs font-mono text-slate-400">Doc Ref: {docRef}</span>
          </div>
          <h1 className="text-3xl font-heading font-extrabold text-white mt-1">
            Candidate Personal Data Sheet – PDF Field Mapper
          </h1>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Dynamic Field Mapping</span>
        </button>
      </div>

      {/* Architecture Info Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3 bg-slate-950">
        <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-2">
          <Layers className="w-4 h-4" />
          <span>5-Tier Field Mapping Flow</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Every field present in the uploaded paper form (<strong>Candidate Personal Data Sheet.pdf</strong>, Ref: RGI/3HR/3F6R3 001) is seamlessly mapped across 5 software tiers:
          <span className="text-amber-300 font-mono font-bold block mt-1">
            Original PDF Field ➔ Digital Web Form Field ➔ Database Field ➔ Generated Resume Field ➔ HR Admin Field
          </span>
        </p>
      </div>

      {/* Mapping Table */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 overflow-hidden space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-800 text-slate-300 uppercase tracking-wider font-bold">
                <th className="py-3 px-4">Original PDF Field Label</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Digital Web Form Key</th>
                <th className="py-3 px-4">Database Path</th>
                <th className="py-3 px-4">Generated Resume Target</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 animate-pulse">
                    Loading PDF field mappings...
                  </td>
                </tr>
              ) : (
                mappings.map((m, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/60">
                    <td className="py-3 px-4 font-bold text-white flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-amber-400" />
                      <span>{m.pdfField}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {m.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-cyan-400 font-bold">
                      {m.webFormField}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      applications.{m.webFormField}
                    </td>
                    <td className="py-3 px-4 text-emerald-400 font-medium">
                      ✓ Auto Generated ({m.category})
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Custom Field Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <form onSubmit={handleAddMapping} className="glass-panel p-6 rounded-3xl max-w-md w-full border border-amber-500/40 space-y-4">
            <h3 className="text-lg font-heading font-extrabold text-white">Add Dynamic PDF Mapping</h3>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">PDF Field Label</label>
              <input
                type="text"
                required
                placeholder="e.g. Aadhaar Number"
                value={newPdfField}
                onChange={e => setNewPdfField(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Web Form Property Key</label>
              <input
                type="text"
                required
                placeholder="e.g. personalDetails.aadhaar"
                value={newWebFormField}
                onChange={e => setNewWebFormField(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
              />
            </div>
            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-extrabold"
              >
                Save Mapping
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

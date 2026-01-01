
import React, { useState, useRef } from 'react';
import { CoachingNote } from '../types';

interface CoachingProps {
  notes: CoachingNote[];
  onAddNote: (note: CoachingNote) => void;
}

export const Coaching: React.FC<CoachingProps> = ({ notes, onAddNote }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newNote, setNewNote] = useState({
    techniqueName: '',
    feedback: '',
    videoUrl: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setNewNote(prev => ({ ...prev, videoUrl: url }));
    }
  };

  const saveNote = () => {
    if (!newNote.techniqueName) return;
    
    onAddNote({
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toLocaleDateString(),
      ...newNote
    });
    setNewNote({ techniqueName: '', feedback: '', videoUrl: '' });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-1 h-6 bg-white"></div>
          <h2 className="text-2xl font-black uppercase tracking-tighter">教練課紀錄 Coaching Logs</h2>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-10 h-10 bg-zinc-100 text-black rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all"
        >
          <i className="fa-solid fa-plus"></i>
        </button>
      </div>

      <div className="space-y-4">
        {notes.length === 0 ? (
          <div className="text-center py-20 border border-zinc-900 border-dashed rounded-3xl">
            <p className="text-zinc-600 text-sm font-medium">目前還沒有教練課紀錄。</p>
          </div>
        ) : (
          notes.map(note => (
            <div key={note.id} className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden group">
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{note.date}</span>
                    <h3 className="text-xl font-bold text-white group-hover:text-zinc-300 transition-colors uppercase">{note.techniqueName}</h3>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500">
                    <i className="fa-solid fa-paperclip text-xs"></i>
                  </div>
                </div>
                
                <p className="text-zinc-400 text-sm leading-relaxed whitespace-pre-line font-medium">
                  {note.feedback}
                </p>

                {note.videoUrl && (
                  <div className="rounded-2xl overflow-hidden aspect-video bg-black border border-zinc-800">
                    <video 
                      src={note.videoUrl} 
                      controls 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-3xl p-6 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black uppercase tracking-tighter">新增上課紀錄</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">運動項目 / 技巧 Movement</label>
                <input 
                  type="text" 
                  value={newNote.techniqueName}
                  onChange={e => setNewNote(prev => ({ ...prev, techniqueName: e.target.value }))}
                  placeholder="例如：硬舉發力點修正"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-sm focus:outline-none font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">教練指導 / 檢討 Feedback</label>
                <textarea 
                  value={newNote.feedback}
                  onChange={e => setNewNote(prev => ({ ...prev, feedback: e.target.value }))}
                  placeholder="記錄關鍵提示、修正重點與注意事項..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-sm focus:outline-none min-h-[120px] font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">動作影片 Analysis Video</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-32 border-2 border-dashed border-zinc-700 rounded-xl flex flex-col items-center justify-center space-y-2 cursor-pointer hover:bg-zinc-800 transition-colors"
                >
                  {newNote.videoUrl ? (
                    <div className="flex items-center space-x-2 text-green-500">
                      <i className="fa-solid fa-circle-check"></i>
                      <span className="text-xs font-bold uppercase">影片已備妥</span>
                    </div>
                  ) : (
                    <>
                      <i className="fa-solid fa-cloud-arrow-up text-zinc-600"></i>
                      <span className="text-xs text-zinc-600 font-medium uppercase tracking-widest">上傳訓練影片</span>
                    </>
                  )}
                  <input 
                    type="file" 
                    accept="video/*" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload}
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={saveNote}
              className="w-full py-4 bg-zinc-100 text-black rounded-xl font-bold uppercase text-sm tracking-widest shadow-xl active:scale-95 transition-all"
            >
              儲存紀錄 Save Record
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';

/**
 * Komponen modal untuk konfirmasi ejaan koreksi AI.
 * 
 * Props:
 * - isOpen: boolean => apakah modal terbuka
 * - correctedSpelling: string => ejaan versi AI
 * - original: string => ejaan input user
 * - onConfirm: function => jika user pilih "Gunakan Ejaan AI"
 * - onCancel: function => jika user pilih "Tetap Ejaan Saya"
 */
function SpellingConfirmModal({ isOpen, correctedSpelling, original, onConfirm, onCancel }) {
  if (!isOpen) return null; // jika modal ga dibuka, return null

  return (
    // Overlay
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {/* Modal box */}
      <div className="bg-white w-full max-w-md mx-2 rounded shadow-lg p-6 relative">
        <h2 className="text-xl font-semibold mb-4">Saran Ejaan AI</h2>
        <p className="mb-4">
          Sistem mendeteksi kemungkinan ejaan berbeda.<br />
          <strong>Input Anda:</strong> {original}<br />
          <strong>Saran AI:</strong> {correctedSpelling}
        </p>
        <p className="mb-4">
          Apakah Anda ingin menggunakan ejaan AI, atau tetap memakai input sendiri?
        </p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Tetap Ejaan Saya
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Gunakan Ejaan AI
          </button>
        </div>
      </div>
    </div>
  );
}

export default SpellingConfirmModal;

/**
 * Purpose: Reusable confirmation modal for user actions
 * Created: 2026-02-12
 */

import { X, AlertTriangle, CheckCircle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onCancel?: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  onCancel,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info'
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: 'text-red-600',
      button: 'bg-red-600 hover:bg-red-700',
      IconComponent: AlertTriangle
    },
    warning: {
      icon: 'text-yellow-600',
      button: 'bg-yellow-600 hover:bg-yellow-700',
      IconComponent: AlertTriangle
    },
    info: {
      icon: 'text-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700',
      IconComponent: AlertTriangle
    },
    success: {
      icon: 'text-green-600',
      button: 'bg-green-600 hover:bg-green-700',
      IconComponent: CheckCircle
    }
  };

  const styles = variantStyles[variant];
  const IconComponent = styles.IconComponent;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="flex justify-between items-start p-6 border-b border-gray-200">
          <div className="flex items-center">
            <IconComponent className={`mr-3 ${styles.icon}`} size={24} />
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="text-gray-700 space-y-3">
            {message.split(/\\n|\n/).filter(line => line.trim()).map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          {cancelText && (
            <button
              onClick={() => {
                if (onCancel) {
                  onCancel();
                } else {
                  onClose();
                }
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors font-medium"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-white rounded-lg transition-colors font-medium ${styles.button}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

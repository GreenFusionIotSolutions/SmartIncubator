import { motion } from 'framer-motion';
import { Incubator } from '../types';

interface IncubatorCardProps {
  incubator: Incubator;
  onClick: () => void;
}

export function IncubatorCard({ incubator, onClick }: IncubatorCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 cursor-pointer"
      onClick={onClick}
    >
      <div className="space-y-2">
      <p className="text-sm text-gray-500">Parent ID: {incubator.parentID}</p>
        <h3 className="text-sm text-gray-500">Parent Name: {incubator.parentName}</h3>
        <p className="text-sm text-gray-500">Baby Gender: {incubator.babyGender}</p>
        <p className="text-sm text-gray-500">
          Date of Birth: {new Date(incubator.babyDOB).toLocaleDateString()}
        </p>
      </div>
    </motion.div>
  );
}

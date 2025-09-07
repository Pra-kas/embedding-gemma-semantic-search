/*
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';
import type { RankedDocument } from '../types';

interface ResultCardProps {
  doc: RankedDocument;
  rank: number;
}

const ResultCard: React.FC<ResultCardProps> = ({ doc, rank }) => {
  const scorePercentage = (doc.score * 100).toFixed(2);
  const barColor = doc.score > 0.5 ? 'bg-green-500' : doc.score > 0.3 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">Rank #{rank}</span>
        <span className="text-sm font-bold text-gray-800 dark:text-gray-200">Score: {scorePercentage}%</span>
      </div>
      <p className="text-gray-700 dark:text-gray-300 mb-3">{doc.text}</p>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
        <div
          className={`${barColor} h-2.5 rounded-full transition-all duration-500`}
          style={{ width: `${scorePercentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ResultCard;
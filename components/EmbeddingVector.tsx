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

interface EmbeddingVectorProps {
  vector: number[];
  theme: 'light' | 'dark';
}

const EmbeddingVector: React.FC<EmbeddingVectorProps> = ({ vector, theme }) => {
  if (!vector || vector.length === 0) {
    return null;
  }

  const truncatedVector = vector.slice(0, 128);
  const minVal = Math.min(...truncatedVector);
  const maxVal = Math.max(...truncatedVector);

  const getColor = (value: number) => {
    if (theme === 'light') {
      // Light mode: blue-white-red
      if (value === 0) return 'rgb(255, 255, 255)';
      if (value < 0) {
        const intensity = minVal !== 0 ? value / minVal : 0;
        const redAndGreen = Math.floor(255 * (1 - intensity));
        return `rgb(${redAndGreen}, ${redAndGreen}, 255)`;
      } else {
        const intensity = maxVal !== 0 ? value / maxVal : 0;
        const greenAndBlue = Math.floor(255 * (1 - intensity));
        return `rgb(255, ${greenAndBlue}, ${greenAndBlue})`;
      }
    } else {
      // Dark mode: blue-black-red
      if (value < 0) {
        const intensity = minVal !== 0 ? value / minVal : 0;
        const blue = Math.floor(255 * intensity);
        return `rgb(0, 0, ${blue})`;
      } else if (value > 0) {
        const intensity = maxVal !== 0 ? value / maxVal : 0;
        const red = Math.floor(255 * intensity);
        return `rgb(${red}, 0, 0)`;
      } else {
        return 'rgb(0, 0, 0)';
      }
    }
  };

  return (
    <svg width="100%" height="20" aria-hidden="true">
      {truncatedVector.map((value, index) => (
        <rect
          key={index}
          x={`${(index / truncatedVector.length) * 100}%`}
          y="0"
          width={`${(1 / truncatedVector.length) * 100}%`}
          height="100%"
          fill={getColor(value)}
        />
      ))}
    </svg>
  );
};

export default EmbeddingVector;
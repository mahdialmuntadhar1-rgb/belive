import React from 'react';
import { motion } from 'motion/react';

const STORIES = [
  { id: 1, name: 'Offers', image: 'https://picsum.photos/seed/offer/200/200', color: '#2CA6A4' },
  { id: 2, name: 'Events', image: 'https://picsum.photos/seed/event/200/200', color: '#E87A41' },
  { id: 3, name: 'New Jobs', image: 'https://picsum.photos/seed/job/200/200', color: '#2B2F33' },
  { id: 4, name: 'Trending', image: 'https://picsum.photos/seed/trend/200/200', color: '#2CA6A4' },
  { id: 5, name: 'Top Rated', image: 'https://picsum.photos/seed/rate/200/200', color: '#E87A41' },
  { id: 6, name: 'Food', image: 'https://picsum.photos/seed/food/200/200', color: '#2CA6A4' },
  { id: 7, name: 'Fashion', image: 'https://picsum.photos/seed/fashion/200/200', color: '#E87A41' },
  { id: 8, name: 'Tech', image: 'https://picsum.photos/seed/tech/200/200', color: '#2B2F33' },
];

export default function StoryRow() {
  const handleStoryClick = (name: string) => {
    // For now, just scroll to the explore section
    const element = document.getElementById('explore-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex gap-6 overflow-x-auto pb-6 no-scrollbar">
          {STORIES.map((story) => (
            <motion.div
              key={story.id}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleStoryClick(story.name)}
              className="flex flex-col items-center gap-3 flex-shrink-0 cursor-pointer group"
            >
              <div className="relative p-1 rounded-[24px] bg-gradient-to-tr from-[#2CA6A4] to-[#E87A41] shadow-lg shadow-[#2CA6A4]/10 group-hover:shadow-[#2CA6A4]/20 transition-all duration-500">
                <div className="w-20 h-20 rounded-[20px] overflow-hidden border-[3px] border-white bg-white">
                  <img 
                    src={story.image} 
                    alt={story.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div 
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full border-[3px] border-white flex items-center justify-center text-[12px] text-white font-black shadow-md"
                  style={{ backgroundColor: story.color }}
                >
                  +
                </div>
              </div>
              <span className="text-[11px] font-black text-[#2B2F33] uppercase tracking-[0.2em] group-hover:text-[#2CA6A4] transition-colors">
                {story.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

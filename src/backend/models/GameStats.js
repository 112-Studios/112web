import mongoose from 'mongoose';

const GameStatsSchema = new mongoose.Schema({
    visits: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    favorites: { type: Number, default: 0 },
    activePlayers: { type: Number, default: 0 },
});

export const GameStats = mongoose.model('GameStats', GameStatsSchema);
import mongoose from 'mongoose';
import User from "./User"
import Category from "./Category"

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 500
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  replies: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: 300
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const readingProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  lastPosition: {
    type: Number,
    default: 0
  },
  completed: {
    type: Boolean,
    default: false
  },
  timeSpent: {
    type: Number,
    default: 0
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  excerpt: {
    type: String,
    required: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true
  },
  coverImage: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  authorAvatar: {
    type: String,
    default: '/images/default-avatar.png'
  },
  authorBio: {
    type: String,
    maxlength: 200
  },
  authorLinks: {
    website: { type: String, trim: true },
    twitter: { type: String, trim: true },
    linkedin: { type: String, trim: true },
    github: { type: String, trim: true },
    youtube: { type: String, trim: true }
  },
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  topics: [{
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    color: { type: String, default: '#3B82F6' }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  bookmarks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  views: {
    type: Number,
    default: 0
  },
  uniqueViews: {
    type: Number,
    default: 0
  },
  viewedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [commentSchema],
  readingProgress: [readingProgressSchema],
  featured: {
    type: Boolean,
    default: false
  },
  published: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date
  },
  metaTitle: {
    type: String,
    trim: true
  },
  metaDescription: {
    type: String,
    trim: true
  },
  estimatedReadTime: {
    type: Number,
    default: 1
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 1
  },
  ratingCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

blogSchema.index({ title: 'text', content: 'text', excerpt: 'text' });
blogSchema.index({ slug: 1 });
blogSchema.index({ author: 1 });
blogSchema.index({ categories: 1 });
blogSchema.index({ topics: 1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ published: 1, publishedAt: -1 });
blogSchema.index({ featured: 1, publishedAt: -1 });
blogSchema.index({ views: -1 });
blogSchema.index({ 'comments.createdAt': -1 });

blogSchema.virtual('commentsCount').get(function() {
  return this.comments ? this.comments.length : 0;
});

blogSchema.virtual('likesCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

blogSchema.virtual('bookmarksCount').get(function() {
  return this.bookmarks ? this.bookmarks.length : 0;
});

blogSchema.virtual('averageRating').get(function() {
  if (this.ratingCount === 0) return 0;
  return (this.rating / this.ratingCount).toFixed(1);
});

blogSchema.virtual('authorDetails', {
  ref: 'User',
  localField: 'author',
  foreignField: '_id',
  justOne: true,
  options: { select: 'name profilePicture email bio' }
});

blogSchema.methods.calculateReadTime = function() {
  const wordsPerMinute = 200;
  const wordCount = this.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
};

blogSchema.methods.addView = function(userId = null) {
  this.views += 1;
  if (userId && !this.viewedBy?.includes(userId)) {
    this.uniqueViews += 1;
    if (!this.viewedBy) this.viewedBy = [];
    this.viewedBy.push(userId);
  }
  return this.save();
};

blogSchema.methods.addLike = function(userId) {
  if (!this.likes.includes(userId)) {
    this.likes.push(userId);
    return this.save();
  }
  return Promise.resolve(this);
};

blogSchema.methods.removeLike = function(userId) {
  this.likes = this.likes.filter(id => id.toString() !== userId.toString());
  return this.save();
};

blogSchema.methods.addBookmark = function(userId) {
  if (!this.bookmarks.includes(userId)) {
    this.bookmarks.push(userId);
    return this.save();
  }
  return Promise.resolve(this);
};

blogSchema.methods.removeBookmark = function(userId) {
  this.bookmarks = this.bookmarks.filter(id => id.toString() !== userId.toString());
  return this.save();
};

blogSchema.methods.addComment = function(userId, content) {
  const comment = {
    user: userId,
    content: content,
    createdAt: new Date()
  };
  this.comments.push(comment);
  return this.save();
};

const Blog = mongoose.models.Blog || mongoose.model('Blog', blogSchema);

export default Blog;
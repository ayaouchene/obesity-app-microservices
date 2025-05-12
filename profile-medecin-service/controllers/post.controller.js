const Post = require('../models/post.model');

const postController = {
  async createPost(req, res) {
    try {
      const { content } = req.body;
      const post = new Post({ doctorId: req.user.userId, content });
      await post.save();
      res.status(201).json(post);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la création du post', error });
    }
  },

  async updatePost(req, res) {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const post = await Post.findOneAndUpdate(
        { _id: id, doctorId: req.user.userId },
        { content },
        { new: true }
      );
      if (!post) return res.status(404).json({ message: 'Post non trouvé ou non autorisé' });
      res.status(200).json(post);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la mise à jour du post', error });
    }
  },

  async deletePost(req, res) {
    try {
      const { id } = req.params;
      const post = await Post.findOneAndDelete({ _id: id, doctorId: req.user.userId });
      if (!post) return res.status(404).json({ message: 'Post non trouvé ou non autorisé' });
      res.status(200).json({ message: 'Post supprimé' });
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la suppression du post', error });
    }
  },

  async likePost(req, res) {
    try {
      const { id } = req.params;
      const post = await Post.findById(id);
      if (!post) return res.status(404).json({ message: 'Post non trouvé' });
      const userType = req.user.role === 'doctor' ? 'doctor' : 'patient';
      if (!post.likes.some(like => like.userId === req.user.userId)) {
        post.likes.push({ userId: req.user.userId, type: userType });
        await post.save();
      }
      res.status(200).json(post);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors du like', error });
    }
  },

  async addComment(req, res) {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const post = await Post.findById(id);
      if (!post) return res.status(404).json({ message: 'Post non trouvé' });
      const userType = req.user.role === 'doctor' ? 'doctor' : 'patient';
      post.comments.push({ userId: req.user.userId, type: userType, content });
      await post.save();
      res.status(201).json(post);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de l\'ajout du commentaire', error });
    }
  },
};

module.exports = postController;
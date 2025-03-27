const infoContent = {
  question0: {
    heading: "How does image augmentation improve model performance?",
    description:
      "Image augmentation enhances model performance by increasing the diversity of training data without collecting new samples. Techniques such as rotation, flipping, brightness adjustment, and noise addition help models generalize better, reducing overfitting and improving accuracy on unseen data.",
    image: "/background/Wave.png",
  },
  question1: {
    heading: "When should I apply image augmentation to my dataset?",
    description:
      "Image augmentation is most beneficial when dealing with limited datasets, preventing overfitting by introducing variations in training samples. It is especially useful in scenarios where data collection is expensive or time-consuming.",
    image: "/background/Wave.png",
  },
  question2: {
    heading: "Which augmentation techniques are best for my dataset?",
    description:
      "Choosing the right augmentation techniques depends on the dataset and task. For classification, transformations like flipping and rotation work well. For object detection, techniques like scaling and cropping help maintain spatial relationships.",
    image: "/background/Wave.png",
  },
  question3: {
    heading: "What are the risks of overusing data augmentation?",
    description:
      "Overusing data augmentation can introduce unrealistic variations, leading to poor generalization. Excessive transformations may distort important features, making the model struggle to learn meaningful patterns from real-world data.",
    image: "/background/Wave.png",
  },
  question4: {
    heading: "How does brightness adjustment affect training?",
    description:
      "Brightness adjustment helps the model adapt to different lighting conditions. However, extreme changes in brightness might make objects unrecognizable, reducing classification accuracy in some cases.",
    image: "/background/Wave.png",
  },
  question5: {
    heading: "Can data augmentation replace collecting real data?",
    description:
      "No, data augmentation can supplement real data but not replace it entirely. While augmentation increases variation, real-world images capture complex details and environmental factors that synthetic transformations cannot fully replicate.",
    image: "/background/Wave.png",
  },
};

export default infoContent;

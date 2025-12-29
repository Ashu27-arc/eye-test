import os

# Model Configuration
MODEL_PATH = 'model.h5'
INPUT_SHAPE = (224, 224, 3)
BATCH_SIZE = 32
EPOCHS = 50

# Dataset Configuration
DATASET_PATH = 'dataset'
TRAIN_SPLIT = 0.8
VALIDATION_SPLIT = 0.1
TEST_SPLIT = 0.1

# Training Configuration
LEARNING_RATE = 0.001
OPTIMIZER = 'adam'
LOSS_FUNCTION = 'categorical_crossentropy'
METRICS = ['accuracy']

# Prediction Configuration
CONFIDENCE_THRESHOLD = 0.7
IMAGE_SIZE = (224, 224)

# Classes
CLASSES = ['normal', 'abnormal']  # Update based on your dataset

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_SAVE_PATH = os.path.join(BASE_DIR, MODEL_PATH)
DATASET_DIR = os.path.join(BASE_DIR, DATASET_PATH)

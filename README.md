# E-Commerce Review Sentiment Analysis & Business Insights


## Project Overview
This project is an end-to-end Natural Language Processing (NLP) and Machine Learning pipeline designed to analyze customer reviews from a Women's Clothing E-Commerce dataset. 

Beyond simply training a classification model, this project focuses on **extracting actionable business insights**. By identifying the root causes of customer dissatisfaction and predicting negative sentiments in real-time, the model provides a data-driven approach to reducing return rates and improving customer experience.

## Business Value & Key Findings
During the Exploratory Data Analysis (EDA) and model evaluation phases, several critical business insights were uncovered:
- **Departmental Crisis:** The *"Trend"* department receives the highest ratio of negative reviews (~30%), indicating an urgent need for quality control intervention.
- **Root Cause of Complaints:** NLP WordCloud analysis on negative reviews revealed that **"size"**, **"small"**, **"color"**, and **"fabric"** are the most frequent pain points. Implementing dynamic sizing warnings on product pages could drastically reduce reverse logistics costs.
- **Helpfulness of Negativity:** Users find negative reviews significantly more "helpful" than positive ones. A real-time sentiment detection model is crucial to flag and address these reviews before they impact conversion rates.

## Methodology
1. **Data Cleaning & Feature Engineering:** Handled missing values (dropped missing review texts, filled titles) and engineered new features like `Word_Count`. Removed irrelevant features like `Clothing ID` to prevent the curse of dimensionality.
2. **NLP Preprocessing:** Applied text lowercasing, punctuation/number removal, stopword removal, and Lemmatization using NLTK to extract the core meaning of the reviews.
3. **Vectorization:** Transformed cleaned text into numerical format using **TF-IDF Vectorizer** (max 5000 features).
4. **Machine Learning Model:** Trained a **Logistic Regression** baseline model. Crucially, applied `class_weight='balanced'` to heavily penalize misclassifying negative reviews, prioritizing the detection of unhappy customers over general accuracy.

## Model Performance
The model was optimized for **Recall on the Negative class** to ensure dissatisfied customers are accurately identified.
- **Overall Accuracy:** 93%
- **Recall (Negative Class):** **89%** *(Successfully caught 423 out of 474 unhappy customers in the test set)*
- **F1-Score (Positive Class):** 96%

# Full-Stack Web Application (Deployment)
To make the AI model accessible to end-users the project features a web architecture:

* **Backend (FastAPI):** REST API (`main.py`) that loads the pre-trained `.pkl` files into memory. It exposes a `/predict` endpoint that processes incoming text, applies the exact same NLP cleaning steps used during training, and returns the sentiment and confidence score in JSON format.
* **Frontend (Next.js & Tailwind CSS):** A responsive, user interface built with React. It features a modern design. It allows users to input reviews and instantly see the model's prediction alongside a session history tracking log.

<img width="1905" height="944" alt="Ekran Görüntüsü (8)" src="https://github.com/user-attachments/assets/2d5351c4-961f-4acd-a84d-88043da958fe" />

<img width="1887" height="966" alt="Ekran Görüntüsü (9)" src="https://github.com/user-attachments/assets/33bd320b-3971-4ca3-b9a7-88b4a10bc0f1" />


